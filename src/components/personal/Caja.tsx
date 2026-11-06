"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  actualizarPedido,
  cuentaRegresiva,
  haceCuanto,
  useAhora,
  usePedidosEnVivo,
  type Pedido,
} from "@/lib/pedidos";
import TarjetaPedido, { Boton, Columna } from "./TarjetaPedido";
import Mesas from "./Mesas";

const etiquetaEstado: Record<string, string> = {
  en_cocina: "En cola de cocina",
  preparando: "Preparando",
  listo: "Listo para llevar",
};

// Panel de caja: verificar pagos de Yasta, entregar y reactivar pedidos
export default function Caja() {
  const [pestana, setPestana] = useState<"pedidos" | "mesas">("pedidos");

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full bg-fondo p-1 ring-1 ring-borde print:hidden" role="tablist">
        {(["pedidos", "mesas"] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={pestana === p}
            onClick={() => setPestana(p)}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors duration-200 ${
              pestana === p ? "bg-texto text-fondo" : "text-suave hover:text-texto"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {pestana === "pedidos" ? <PedidosCaja /> : <Mesas />}
    </div>
  );
}

function PedidosCaja() {
  const { pedidos, cargando, error } = usePedidosEnVivo(12);
  const ahora = useAhora(1000);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmarRechazo, setConfirmarRechazo] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState("");

  // Cada 20 segundos cancela los pedidos que pasaron sus 10 minutos sin pago
  useEffect(() => {
    const vencer = () => supabase().rpc("vencer_pedidos");
    vencer();
    const t = setInterval(vencer, 20000);
    return () => clearInterval(t);
  }, []);

  const hacer = async (p: Pedido, cambios: Parameters<typeof actualizarPedido>[1]) => {
    setOcupado(p.id);
    setErrorAccion("");
    try {
      await actualizarPedido(p.id, cambios);
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo guardar el cambio");
    } finally {
      setOcupado(null);
      setConfirmarRechazo(null);
    }
  };

  const confirmarPago = (p: Pedido) =>
    hacer(p, { estado: "en_cocina", pagado_en: new Date().toISOString(), cancelado_motivo: null });

  const esperando = pedidos.filter((p) => p.estado === "verificar_pago" || p.estado === "pagar_en_caja");
  const enCurso = pedidos
    .filter((p) => ["en_cocina", "preparando", "listo"].includes(p.estado))
    .sort((a, b) => (a.pagado_en ?? a.creado).localeCompare(b.pagado_en ?? b.creado));
  const hace2h = ahora - 2 * 3600_000;
  const cancelados = pedidos
    .filter((p) => p.estado === "cancelado" && new Date(p.creado).getTime() > hace2h)
    .reverse();
  const entregados = pedidos.filter((p) => p.estado === "entregado");
  const vendido = entregados.reduce((s, p) => s + p.total, 0);

  if (cargando) return <p className="text-suave">Cargando pedidos...</p>;

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <Resumen etiqueta="Esperando pago" valor={esperando.length} destacar={esperando.length > 0} />
        <Resumen etiqueta="En cocina" valor={enCurso.length} />
        <Resumen etiqueta="Entregados (12 h)" valor={entregados.length} />
        <Resumen etiqueta="Vendido (12 h)" valor={`Bs ${vendido}`} />
      </div>

      {(error || errorAccion) && (
        <p role="alert" className="mb-4 rounded-xl bg-acento-suave px-4 py-3 text-sm text-acento-texto">
          {errorAccion || `Error de conexión: ${error}`}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Columna titulo="Esperando pago" cantidad={esperando.length} vacio="Cuando un cliente confirme su pedido, aparecerá aquí.">
          {esperando.map((p) => {
            const reloj = cuentaRegresiva(p.vence_en, ahora);
            return (
              <TarjetaPedido
                key={p.id}
                pedido={p}
                resaltado
                arriba={
                  <span className={`font-semibold tabular-nums ${reloj.segundos < 120 ? "text-acento-texto" : ""}`}>
                    Vence en {reloj.texto}
                  </span>
                }
              >
                <p className="w-full text-sm text-suave">
                  Busca en Yasta un pago de <b className="text-texto">Bs {p.total}</b>.
                </p>
                <Boton tipo="principal" onClick={() => confirmarPago(p)} deshabilitado={ocupado === p.id}>
                  Pago recibido
                </Boton>
                {confirmarRechazo === p.id ? (
                  <Boton tipo="peligro" onClick={() => hacer(p, { estado: "cancelado", cancelado_motivo: "rechazado" })}>
                    Sí, rechazar
                  </Boton>
                ) : (
                  <Boton tipo="peligro" onClick={() => setConfirmarRechazo(p.id)}>
                    Rechazar
                  </Boton>
                )}
              </TarjetaPedido>
            );
          })}
        </Columna>

        <Columna titulo="En cocina" cantidad={enCurso.length} vacio="No hay pedidos en preparación.">
          {enCurso.map((p) => (
            <TarjetaPedido
              key={p.id}
              pedido={p}
              arriba={
                <>
                  <span className={`block font-semibold ${p.estado === "listo" ? "text-acento-texto" : ""}`}>
                    {etiquetaEstado[p.estado]}
                  </span>
                  <span className="text-suave">pagado {haceCuanto(p.pagado_en, ahora)}</span>
                </>
              }
            >
              {p.estado === "listo" && (
                <Boton tipo="principal" onClick={() => hacer(p, { estado: "entregado" })} deshabilitado={ocupado === p.id}>
                  Entregado en la mesa
                </Boton>
              )}
            </TarjetaPedido>
          ))}
        </Columna>

        <Columna titulo="Cancelados (2 h)" cantidad={cancelados.length} vacio="Sin pedidos cancelados.">
          {cancelados.map((p) => (
            <TarjetaPedido
              key={p.id}
              pedido={p}
              arriba={<span className="text-suave">{p.cancelado_motivo === "rechazado" ? "Rechazado" : "No se pagó a tiempo"}</span>}
            >
              <p className="w-full text-sm text-suave">¿El pago llegó tarde? Reactívalo y pasa directo a cocina.</p>
              <Boton onClick={() => confirmarPago(p)} deshabilitado={ocupado === p.id}>
                Pago recibido, reactivar
              </Boton>
            </TarjetaPedido>
          ))}
        </Columna>
      </div>
    </>
  );
}

function Resumen({ etiqueta, valor, destacar = false }: { etiqueta: string; valor: number | string; destacar?: boolean }) {
  return (
    <div className={`min-w-36 rounded-2xl px-4 py-3 ring-1 ${destacar ? "bg-acento-suave ring-acento/30" : "bg-fondo ring-borde"}`}>
      <p className={`text-sm ${destacar ? "text-acento-texto" : "text-suave"}`}>{etiqueta}</p>
      <p className={`font-display text-2xl font-bold tabular-nums ${destacar ? "text-acento-texto" : ""}`}>{valor}</p>
    </div>
  );
}
