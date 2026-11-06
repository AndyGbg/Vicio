-- =====================================================================
--  VICIO · Cambio 02: pago con el QR de Yasta y 10 minutos para pagar
--  Cómo usarlo: Supabase > SQL Editor > New query > pega TODO > Run.
--  (Se ejecuta DESPUÉS de esquema.sql, una sola vez.)
--
--  Flujo:
--   1. El cliente confirma su pedido -> estado 'verificar_pago' (esperando pago),
--      vence en 10 minutos.
--   2. Caja ve el dinero en Yasta y toca "Pago recibido" -> 'en_cocina'
--      (se guarda pagado_en, que la cocina muestra como "hace X min").
--   3. Si nadie confirma en 10 minutos -> 'cancelado' (motivo 'vencido').
--      Caja puede reactivarlo si el pago llegó tarde.
-- =====================================================================

alter table pedidos add column if not exists vence_en timestamptz;
alter table pedidos add column if not exists pagado_en timestamptz;
alter table pedidos add column if not exists cancelado_motivo text;  -- 'vencido' o 'rechazado'

-- La cocina tampoco puede tocar estos campos nuevos
-- (sin "security definer": así current_user es quien hace el cambio)
create or replace function cocina_solo_estado() returns trigger
language plpgsql set search_path = public as $$
begin
  -- solo revisa cambios hechos directo desde el panel (no los de funciones internas)
  if current_user = 'authenticated' and mi_rol() = 'cocina' and (
       new.mesa is distinct from old.mesa or new.total is distinct from old.total or
       new.metodo is distinct from old.metodo or new.nota is distinct from old.nota or
       new.creado is distinct from old.creado or new.vence_en is distinct from old.vence_en or
       new.pagado_en is distinct from old.pagado_en or new.cancelado_motivo is distinct from old.cancelado_motivo) then
    raise exception 'La cocina solo puede cambiar el estado del pedido';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------
--  vencer_pedidos: cancela los pedidos que pasaron sus 10 minutos sin pago
-- ---------------------------------------------------------------------
create or replace function vencer_pedidos() returns int
language plpgsql security definer set search_path = public as $$
declare
  n int;
begin
  update pedidos
     set estado = 'cancelado', cancelado_motivo = 'vencido'
   where estado = 'verificar_pago' and vence_en is not null and vence_en < now();
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------
--  crear_pedido (nueva versión): siempre pago por QR, vence en 10 minutos
-- ---------------------------------------------------------------------
drop function if exists crear_pedido(int, text, jsonb, metodo_pago, text);
drop function if exists crear_pedido(int, text, jsonb, text);

create function crear_pedido(
  p_mesa int,
  p_codigo text,
  p_items jsonb,
  p_nota text default null
) returns table (pedido_id uuid, numero int, total numeric, vence_en timestamptz)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_pedido uuid;
  v_numero int;
  v_vence timestamptz := now() + interval '10 minutes';
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_prod productos%rowtype;
  v_cant int;
  v_extras jsonb;
  v_precio numeric(8, 2);
  v_reciente int;
begin
  if not exists (select 1 from mesas m where m.numero = p_mesa and m.codigo = p_codigo and m.activa) then
    raise exception 'Este QR no es válido. Escanea de nuevo el QR de tu mesa.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido está vacío';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Demasiados productos en un solo pedido';
  end if;

  -- Anti-broma: máximo 5 pedidos por mesa cada 10 minutos
  select count(*) into v_reciente from pedidos p
    where p.mesa = p_mesa and p.creado > now() - interval '10 minutes';
  if v_reciente >= 5 then
    raise exception 'Demasiados pedidos seguidos desde esta mesa. Pide ayuda en caja.';
  end if;

  insert into pedidos (mesa, estado, metodo, total, nota, vence_en)
    values (p_mesa, 'verificar_pago', 'qr', 0, nullif(trim(p_nota), ''), v_vence)
    returning pedidos.id, pedidos.numero into v_pedido, v_numero;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_prod from productos pr where pr.id = v_item ->> 'producto_id' and pr.disponible;
    if not found then
      raise exception 'Producto no disponible: %', v_item ->> 'producto_id';
    end if;

    v_cant := coalesce((v_item ->> 'cantidad')::int, 0);
    if v_cant < 1 or v_cant > 20 then
      raise exception 'Cantidad inválida';
    end if;

    select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'nombre', e.nombre, 'precio', e.precio)), '[]'),
           v_prod.precio + coalesce(sum(e.precio), 0)
      into v_extras, v_precio
      from extras e
      where v_prod.personalizable and e.activo
        and e.id in (select jsonb_array_elements_text(coalesce(v_item -> 'extras', '[]')));

    insert into pedido_items (pedido_id, producto_id, nombre, cantidad, precio_unitario, extras, quitar, nota)
      values (v_pedido, v_prod.id, v_prod.nombre, v_cant, v_precio, v_extras,
              coalesce(array(select jsonb_array_elements_text(coalesce(v_item -> 'quitar', '[]'))), '{}'),
              nullif(trim(v_item ->> 'nota'), ''));

    v_total := v_total + v_precio * v_cant;
  end loop;

  update pedidos set total = v_total where pedidos.id = v_pedido;

  return query select v_pedido, v_numero, v_total, v_vence;
end $$;

-- ---------------------------------------------------------------------
--  consultar_pedido: el cliente ve el estado de SU pedido (con su id).
--  Si ya pasaron los 10 minutos sin pago, lo cancela en ese momento.
-- ---------------------------------------------------------------------
drop function if exists estado_pedido_de(uuid);

create or replace function consultar_pedido(p_id uuid)
returns table (numero int, mesa int, estado estado_pedido, total numeric,
               vence_en timestamptz, pagado_en timestamptz, cancelado_motivo text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  update pedidos
     set estado = 'cancelado', cancelado_motivo = 'vencido'
   where pedidos.id = p_id and pedidos.estado = 'verificar_pago' and pedidos.vence_en < now();

  return query
    select p.numero, p.mesa, p.estado, p.total, p.vence_en, p.pagado_en, p.cancelado_motivo
      from pedidos p where p.id = p_id;
end $$;

revoke all on function crear_pedido(int, text, jsonb, text) from public;
revoke all on function consultar_pedido(uuid) from public;
revoke all on function vencer_pedidos() from public;
grant execute on function crear_pedido(int, text, jsonb, text) to anon, authenticated;
grant execute on function consultar_pedido(uuid) to anon, authenticated;
revoke all on function vencer_pedidos() from anon;
grant execute on function vencer_pedidos() to authenticated;

-- La caja ve los pedidos en vivo con estos campos nuevos (ya está en realtime)

-- Que Supabase reconozca las funciones nuevas de inmediato
notify pgrst, 'reload schema';
