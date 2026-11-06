-- =====================================================================
--  VICIO · Base de datos (Supabase / PostgreSQL)
--  Cómo usarlo: Supabase > SQL Editor > New query > pega TODO > Run.
--  Se puede ejecutar una sola vez en un proyecto nuevo.
-- =====================================================================

-- ---------- Tipos ----------
create type rol_personal as enum ('admin', 'cocina');

create type estado_pedido as enum (
  'verificar_pago',  -- pagó con QR, caja debe confirmar
  'pagar_en_caja',   -- eligió pagar en caja
  'en_cocina',       -- pagado, esperando que cocina empiece
  'preparando',
  'listo',           -- listo para llevar a la mesa
  'entregado',
  'cancelado'
);

create type metodo_pago as enum ('qr', 'caja');

-- ---------- Personal (admin/caja y cocina) ----------
-- Las cuentas se crean en Supabase > Authentication > Users.
-- Aquí solo guardamos el nombre y el rol de cada una.
create table perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol rol_personal not null,
  creado timestamptz not null default now()
);

-- ---------- Mesas ----------
create table mesas (
  numero int primary key check (numero > 0),
  codigo text not null default substr(md5(random()::text), 1, 6), -- va en el QR
  activa boolean not null default true
);

-- ---------- Menú ----------
create table categorias (
  id text primary key,          -- ej: 'hamburguesas'
  nombre text not null,
  icono text not null,          -- nombre del ícono en la app
  orden int not null default 0,
  activa boolean not null default true
);

create table productos (
  id text primary key,          -- ej: 'hamburguesa-1' (también nombre de la foto)
  categoria_id text not null references categorias (id),
  nombre text not null,
  descripcion text not null default '',
  precio numeric(8, 2) not null check (precio >= 0),
  imagen text,                  -- ruta, ej: /productos/hamburguesa-1.jpg
  destacado boolean not null default false,
  etiqueta text,
  personalizable boolean not null default false,
  disponible boolean not null default true,  -- false = "agotado"
  orden int not null default 0
);

create table extras (
  id text primary key,
  nombre text not null,
  precio numeric(8, 2) not null check (precio >= 0),
  activo boolean not null default true
);

-- ---------- Pedidos ----------
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  numero int generated always as identity,  -- número que se muestra (#412)
  mesa int not null references mesas (numero),
  estado estado_pedido not null,
  metodo metodo_pago not null,
  total numeric(10, 2) not null,
  nota text,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);

create table pedido_items (
  id bigint generated always as identity primary key,
  pedido_id uuid not null references pedidos (id) on delete cascade,
  producto_id text not null references productos (id),
  nombre text not null,                -- copia del nombre al momento de pedir
  cantidad int not null check (cantidad > 0),
  precio_unitario numeric(8, 2) not null,  -- precio + extras, calculado por el servidor
  extras jsonb not null default '[]',
  quitar text[] not null default '{}',
  nota text
);

create index pedidos_estado_idx on pedidos (estado, creado);
create index pedido_items_pedido_idx on pedido_items (pedido_id);

-- Mantener "actualizado" al día
create function tocar_actualizado() returns trigger language plpgsql as $$
begin
  new.actualizado := now();
  return new;
end $$;

create trigger pedidos_actualizado before update on pedidos
  for each row execute function tocar_actualizado();

-- =====================================================================
--  Funciones de ayuda para las reglas de seguridad
-- =====================================================================
create function mi_rol() returns rol_personal
language sql stable security definer set search_path = public as $$
  select rol from perfiles where id = auth.uid()
$$;

create function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(mi_rol() = 'admin', false)
$$;

create function es_personal() returns boolean
language sql stable security definer set search_path = public as $$
  select mi_rol() is not null
$$;

-- =====================================================================
--  Reglas de seguridad (RLS)
--  Cliente (sin login): solo ve el menú y crea pedidos con crear_pedido().
--  Cocina: ve pedidos pagados y cambia su estado.
--  Admin/caja: puede todo.
-- =====================================================================
alter table perfiles enable row level security;
alter table mesas enable row level security;
alter table categorias enable row level security;
alter table productos enable row level security;
alter table extras enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;

-- Perfiles: cada uno ve el suyo; admin ve y edita todos
create policy "ver mi perfil" on perfiles for select using (id = auth.uid() or es_admin());
create policy "admin edita perfiles" on perfiles for all using (es_admin()) with check (es_admin());

-- Menú: todos lo ven (solo lo activo); admin edita
create policy "ver categorias" on categorias for select using (activa or es_admin());
create policy "admin categorias" on categorias for all using (es_admin()) with check (es_admin());
create policy "ver productos" on productos for select using (true);
create policy "admin productos" on productos for all using (es_admin()) with check (es_admin());
create policy "ver extras" on extras for select using (activo or es_admin());
create policy "admin extras" on extras for all using (es_admin()) with check (es_admin());

-- Mesas: el código del QR es secreto, solo el admin las ve
create policy "admin mesas" on mesas for all using (es_admin()) with check (es_admin());

-- Pedidos: admin ve todo; cocina ve solo los ya pagados
create policy "admin pedidos" on pedidos for all using (es_admin()) with check (es_admin());
create policy "cocina ve pedidos" on pedidos for select
  using (mi_rol() = 'cocina' and estado in ('en_cocina', 'preparando', 'listo'));
create policy "cocina actualiza pedidos" on pedidos for update
  using (mi_rol() = 'cocina' and estado in ('en_cocina', 'preparando', 'listo'))
  with check (mi_rol() = 'cocina' and estado in ('en_cocina', 'preparando', 'listo'));

-- La cocina solo puede cambiar el ESTADO (no el total, la mesa, etc.)
create function cocina_solo_estado() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if mi_rol() = 'cocina' and (
       new.mesa is distinct from old.mesa or new.total is distinct from old.total or
       new.metodo is distinct from old.metodo or new.nota is distinct from old.nota or
       new.creado is distinct from old.creado) then
    raise exception 'La cocina solo puede cambiar el estado del pedido';
  end if;
  return new;
end $$;

create trigger pedidos_cocina_solo_estado before update on pedidos
  for each row execute function cocina_solo_estado();

create policy "personal ve items" on pedido_items for select
  using (exists (select 1 from pedidos p where p.id = pedido_id));  -- hereda la regla de pedidos

-- Permisos de tabla (las reglas de arriba filtran las filas)
grant select on categorias, productos, extras to anon, authenticated;
grant select, insert, update, delete on categorias, productos, extras, mesas, perfiles to authenticated;
grant select, update on pedidos to authenticated;
grant insert, delete on pedidos to authenticated;
grant select on pedido_items to authenticated;

-- =====================================================================
--  crear_pedido: la ÚNICA forma en que un cliente crea un pedido.
--  Valida la mesa y su código, y calcula los precios con la base de datos
--  (así nadie puede cambiar el total desde su celular).
--
--  p_items: [{"producto_id":"hamburguesa-1","cantidad":2,
--             "extras":["x-queso"],"quitar":["Sin cebolla"],"nota":"bien cocida"}]
-- =====================================================================
create function crear_pedido(
  p_mesa int,
  p_codigo text,
  p_items jsonb,
  p_metodo metodo_pago,
  p_nota text default null
) returns table (pedido_id uuid, numero int, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_pedido uuid;
  v_numero int;
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_prod productos%rowtype;
  v_cant int;
  v_extras jsonb;
  v_precio numeric(8, 2);
  v_reciente int;
begin
  -- 1. Mesa válida y código correcto
  if not exists (select 1 from mesas m where m.numero = p_mesa and m.codigo = p_codigo and m.activa) then
    raise exception 'Mesa o código QR inválido';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido está vacío';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Demasiados productos en un solo pedido';
  end if;

  -- 2. Límite anti-broma: máximo 5 pedidos por mesa cada 10 minutos
  select count(*) into v_reciente from pedidos
    where mesa = p_mesa and creado > now() - interval '10 minutes';
  if v_reciente >= 5 then
    raise exception 'Demasiados pedidos seguidos desde esta mesa. Pide ayuda en caja.';
  end if;

  insert into pedidos (mesa, estado, metodo, total, nota)
    values (p_mesa,
            case when p_metodo = 'qr' then 'verificar_pago'::estado_pedido else 'pagar_en_caja'::estado_pedido end,
            p_metodo, 0, nullif(trim(p_nota), ''))
    returning id, pedidos.numero into v_pedido, v_numero;

  -- 3. Cada producto con su precio real
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_prod from productos where id = v_item ->> 'producto_id' and disponible;
    if not found then
      raise exception 'Producto no disponible: %', v_item ->> 'producto_id';
    end if;

    v_cant := coalesce((v_item ->> 'cantidad')::int, 0);
    if v_cant < 1 or v_cant > 20 then
      raise exception 'Cantidad inválida';
    end if;

    -- extras solo si el producto es personalizable
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

  update pedidos set total = v_total where id = v_pedido;

  return query select v_pedido, v_numero, v_total;
end $$;

-- estado_pedido_de: el cliente consulta el estado de SU pedido (con el id que recibió)
create function estado_pedido_de(p_id uuid)
returns table (numero int, estado estado_pedido, total numeric)
language sql stable security definer set search_path = public as $$
  select numero, estado, total from pedidos where id = p_id
$$;

-- validar_mesa: la página del cliente revisa que el QR sea válido
create function validar_mesa(p_mesa int, p_codigo text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from mesas where numero = p_mesa and codigo = p_codigo and activa)
$$;

revoke all on function crear_pedido(int, text, jsonb, metodo_pago, text) from public;
revoke all on function estado_pedido_de(uuid) from public;
revoke all on function validar_mesa(int, text) from public;
grant execute on function crear_pedido(int, text, jsonb, metodo_pago, text) to anon, authenticated;
grant execute on function estado_pedido_de(uuid) to anon, authenticated;
grant execute on function validar_mesa(int, text) to anon, authenticated;

-- =====================================================================
--  Tiempo real: la cocina y la caja reciben los pedidos al instante
-- =====================================================================
alter publication supabase_realtime add table pedidos;

-- =====================================================================
--  DATOS INICIALES (menú provisional: cámbialo cuando tengas el oficial)
-- =====================================================================
insert into mesas (numero) select generate_series(1, 10);  -- cambia 10 por el número real de mesas

insert into categorias (id, nombre, icono, orden) values
  ('hamburguesas', 'Hamburguesas', 'hamburguesa', 1),
  ('pipocas', 'Pipocas de pollo', 'pipocas', 2),
  ('alitas', 'Alitas', 'alitas', 3),
  ('refrescos', 'Refrescos', 'refresco', 4),
  ('bebidas', 'Bebidas', 'bebida', 5);

insert into productos (id, categoria_id, nombre, descripcion, precio, imagen, destacado, etiqueta, personalizable, orden) values
  ('hamburguesa-1', 'hamburguesas', 'Hamburguesa Clásica', 'Carne, queso, lechuga, tomate y salsa de la casa', 30, '/productos/hamburguesa-1.jpg', false, null, true, 1),
  ('hamburguesa-2', 'hamburguesas', 'Hamburguesa con Tocino', 'Carne, queso, tocino crocante y cebolla', 30, '/productos/hamburguesa-2.jpg', false, null, true, 2),
  ('hamburguesa-3', 'hamburguesas', 'Hamburguesa Doble', 'Doble carne, doble queso y salsa de la casa', 45, '/productos/hamburguesa-3.jpg', true, null, true, 3),
  ('hamburguesa-4', 'hamburguesas', 'Hamburguesa Vicio', 'La especial de la casa', 45, '/productos/hamburguesa-4.jpg', true, 'Favorita', true, 4),
  ('pipocas', 'pipocas', 'Pipocas de pollo', 'Papas fritas con pipocas de pollo crocante', 25, '/productos/pipocas.jpg', true, null, false, 1),
  ('alitas-6', 'alitas', 'Alitas x6', 'Seis alitas con papas fritas', 30, '/productos/alitas-6.jpg', true, null, false, 1),
  ('alitas-12', 'alitas', 'Alitas x12', 'Doce alitas con papas fritas, para compartir', 55, '/productos/alitas-12.jpg', false, null, false, 2),
  ('coca-cola', 'refrescos', 'Coca-Cola', 'Bien fría', 8, '/productos/coca-cola.jpg', false, null, false, 1),
  ('sprite', 'refrescos', 'Sprite', 'Bien fría', 8, '/productos/sprite.jpg', false, null, false, 2),
  ('fanta', 'refrescos', 'Fanta', 'Bien fría', 8, '/productos/fanta.jpg', false, null, false, 3),
  ('mini', 'refrescos', 'Mini en vidrio', 'La clásica botellita de vidrio. Coca-Cola, Sprite o Fanta', 5, '/productos/mini.jpg', false, 'Las famosas', false, 4),
  ('limonada', 'bebidas', 'Limonada', 'Natural, hecha al momento', 10, '/productos/limonada.jpg', false, null, false, 1),
  ('mocochinchi', 'bebidas', 'Mocochinchi', 'Bien heladito', 7, '/productos/mocochinchi.jpg', false, null, false, 2);

insert into extras (id, nombre, precio) values
  ('x-queso', 'Extra queso', 4),
  ('x-tocino', 'Extra tocino', 6),
  ('x-huevo', 'Huevo frito', 4);

-- =====================================================================
--  CUENTAS DEL PERSONAL (hazlo DESPUÉS de crear los usuarios)
--  1. Supabase > Authentication > Users > Add user > Create new user
--     (correo + contraseña, marca "Auto Confirm User").
--  2. Crea uno para caja y otro para cocina.
--  3. Ejecuta esto cambiando los correos por los que usaste:
--
--  insert into perfiles (id, nombre, rol)
--    select id, 'Caja', 'admin' from auth.users where email = 'caja@vicio.bo';
--  insert into perfiles (id, nombre, rol)
--    select id, 'Cocina', 'cocina' from auth.users where email = 'cocina@vicio.bo';
-- =====================================================================
