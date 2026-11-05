"use client";

import { precioUnitario, type ItemCarrito } from "@/data/menu";
import Sheet from "./Sheet";
import Contador from "./Contador";
import Foto from "./Foto";

export default function CarritoSheet({
  mesa,
  items,
  notaGeneral,
  onNotaGeneral,
  onCantidad,
  onCerrar,
  onCerrando,
  onEnviar,
}: {
  mesa: string;
  items: ItemCarrito[];
  notaGeneral: string;
  onNotaGeneral: (s: string) => void;
  onCantidad: (clave: string, n: number) => void;
  onCerrar: () => void;
  onCerrando: () => void;
  onEnviar: () => void;
}) {
  const total = items.reduce((s, i) => s + precioUnitario(i) * i.cantidad, 0);

  return (
    <Sheet onCerrar={onCerrar} onCerrando={onCerrando} etiqueta="Tu pedido">
      {(cerrar) => (
        <>
          <div className="px-5 pb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Tu pedido</h2>
            <p className="mt-1 inline-block rounded-full bg-superficie px-3 py-1 text-sm font-semibold">Para la mesa {mesa}</p>

            <ul className="mt-4 divide-y divide-borde">
              {items.map((i) => {
                const detalles = [...i.quitar, ...i.extras.map((e) => `+ ${e.nombre}`)];
                return (
                  <li key={i.clave} className="flex gap-3 py-4">
                    <Foto
                      src={i.producto.imagen}
                      alt={i.producto.nombre}
                      categoria={i.producto.categoria}
                      sizes="56px"
                      icono={22}
                      className="size-14 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold leading-tight">{i.producto.nombre}</p>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">Bs {precioUnitario(i) * i.cantidad}</p>
                      </div>
                      {detalles.length > 0 && <p className="mt-0.5 text-sm text-suave">{detalles.join(", ")}</p>}
                      {i.nota && <p className="mt-0.5 text-sm italic text-suave">“{i.nota}”</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          onClick={() => onCantidad(i.clave, 0)}
                          className="text-sm text-suave underline underline-offset-4 decoration-borde"
                        >
                          Quitar
                        </button>
                        <Contador valor={i.cantidad} min={0} onCambiar={(n) => onCantidad(i.clave, n)} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <label htmlFor="nota-general" className="mt-4 block font-semibold">
              ¿Algo más para cocina? <span className="font-normal text-suave">(opcional)</span>
            </label>
            <textarea
              id="nota-general"
              value={notaGeneral}
              onChange={(e) => onNotaGeneral(e.target.value)}
              rows={2}
              placeholder="Ej: traer servilletas extra"
              className="mt-2 w-full resize-none rounded-xl bg-superficie px-4 py-3 ring-1 ring-borde placeholder:text-suave focus:outline-none focus:ring-2 focus:ring-acento"
            />

            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-suave">Total</span>
              <span className="font-display text-3xl font-bold tabular-nums">Bs {total}</span>
            </div>
            <p className="mt-1 text-sm text-suave">En el siguiente paso pagas con QR desde tu celular.</p>
          </div>

          <div className="sticky bottom-0 border-t border-borde bg-elevada/95 px-5 py-4 backdrop-blur">
            <button
              onClick={() => cerrar(onEnviar)}
              className="presionable w-full rounded-full bg-acento py-4 text-lg font-semibold text-white shadow-[0_8px_24px_rgb(var(--sombra-acento)/0.32)]"
            >
              Continuar al pago
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
