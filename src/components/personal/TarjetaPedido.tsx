"use client";

import { detalleItem, type Pedido } from "@/lib/pedidos";

// Tarjeta de un pedido (la usan caja y cocina)
export default function TarjetaPedido({
  pedido,
  arriba,
  resaltado = false,
  grande = false,
  children,
}: {
  pedido: Pedido;
  arriba?: React.ReactNode; // texto a la derecha del encabezado (tiempo, estado)
  resaltado?: boolean;
  grande?: boolean; // letra más grande para cocina
  children?: React.ReactNode; // botones
}) {
  return (
    <article
      className={`rounded-2xl bg-fondo p-4 shadow-[0_1px_2px_rgb(0_0_0/0.05)] ring-1 animate-asomar ${
        resaltado ? "ring-2 ring-acento" : "ring-borde"
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-display font-bold leading-none tracking-tight ${grande ? "text-3xl" : "text-2xl"}`}>
            Mesa {pedido.mesa}
          </p>
          <p className="mt-1 text-sm text-suave">
            Pedido <b className="text-texto">#{pedido.numero}</b> · Bs {pedido.total}
          </p>
        </div>
        <div className="text-right text-sm">{arriba}</div>
      </header>

      <ul className={`mt-3 space-y-1.5 border-t border-borde pt-3 ${grande ? "text-lg" : ""}`}>
        {pedido.pedido_items.map((i) => {
          const detalle = detalleItem(i);
          return (
            <li key={i.id}>
              <span className="font-bold tabular-nums">{i.cantidad}×</span> {i.nombre}
              {detalle && <span className="block pl-6 text-sm font-medium text-acento-texto">{detalle}</span>}
              {i.nota && <span className="block pl-6 text-sm italic text-suave">“{i.nota}”</span>}
            </li>
          );
        })}
      </ul>
      {pedido.nota && (
        <p className="mt-2 rounded-xl bg-superficie px-3 py-2 text-sm">
          <b>Nota:</b> {pedido.nota}
        </p>
      )}

      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </article>
  );
}

export function Boton({
  onClick,
  tipo = "secundario",
  children,
  deshabilitado = false,
}: {
  onClick: () => void;
  tipo?: "principal" | "secundario" | "peligro";
  children: React.ReactNode;
  deshabilitado?: boolean;
}) {
  const estilos = {
    principal: "bg-acento text-white",
    secundario: "bg-superficie text-texto ring-1 ring-borde",
    peligro: "bg-fondo text-acento-texto ring-1 ring-acento/40",
  }[tipo];
  return (
    <button
      onClick={onClick}
      disabled={deshabilitado}
      className={`presionable flex-1 rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${estilos}`}
    >
      {children}
    </button>
  );
}

export function Columna({
  titulo,
  cantidad,
  vacio,
  children,
}: {
  titulo: string;
  cantidad: number;
  vacio: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        {titulo}
        <span className="grid min-w-6 place-items-center rounded-full bg-fondo px-2 text-sm tabular-nums ring-1 ring-borde">
          {cantidad}
        </span>
      </h2>
      <div className="space-y-3">
        {cantidad === 0 ? <p className="rounded-2xl border border-dashed border-borde p-6 text-center text-sm text-suave">{vacio}</p> : children}
      </div>
    </section>
  );
}
