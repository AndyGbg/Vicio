"use client";

import { useState } from "react";
import { HugeiconsIcon } from "../Icono";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { extras as todosExtras, quitables, type Extra, type Producto } from "@/data/menu";
import Sheet from "./Sheet";
import Contador from "./Contador";
import Foto from "./Foto";

type Eleccion = { cantidad: number; extras: Extra[]; quitar: string[]; nota: string };

export default function ProductoSheet({
  producto,
  onCerrar,
  onCerrando,
  onAgregar,
}: {
  producto: Producto;
  onCerrar: () => void;
  onCerrando: () => void;
  onAgregar: (d: Eleccion) => void;
}) {
  const [cantidad, setCantidad] = useState(1);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [quitar, setQuitar] = useState<string[]>([]);
  const [nota, setNota] = useState("");

  const total = (producto.precio + extras.reduce((s, e) => s + e.precio, 0)) * cantidad;

  const alternarExtra = (e: Extra) =>
    setExtras((xs) => (xs.some((x) => x.id === e.id) ? xs.filter((x) => x.id !== e.id) : [...xs, e]));
  const alternarQuitar = (q: string) =>
    setQuitar((qs) => (qs.includes(q) ? qs.filter((x) => x !== q) : [...qs, q]));

  return (
    <Sheet onCerrar={onCerrar} onCerrando={onCerrando} etiqueta={producto.nombre}>
      {(cerrar) => (
        <>
          <div className="px-5 pb-6">
            <Foto
              src={producto.imagen}
              alt={producto.nombre}
              categoria={producto.categoria}
              sizes="(max-width: 576px) 100vw, 576px"
              icono={48}
              className="aspect-[4/3] rounded-2xl"
            />
            <div className="mt-5 flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">{producto.nombre}</h2>
              <span className="shrink-0 pt-1 text-lg font-semibold tabular-nums text-acento-texto">Bs {producto.precio}</span>
            </div>
            <p className="mt-1.5 text-suave">{producto.descripcion}</p>

            {producto.personalizable && (
              <>
                <h3 className="mt-7 font-semibold">¿Le quitamos algo?</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quitables.map((q) => {
                    const activo = quitar.includes(q);
                    return (
                      <button
                        key={q}
                        aria-pressed={activo}
                        onClick={() => alternarQuitar(q)}
                        className={`presionable rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors duration-150 ${
                          activo ? "bg-acento-suave text-acento-texto ring-acento" : "bg-superficie text-texto ring-borde"
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>

                <h3 className="mt-7 font-semibold">Agrégale más</h3>
                <ul className="mt-2 divide-y divide-borde">
                  {todosExtras.map((e) => {
                    const activo = extras.some((x) => x.id === e.id);
                    return (
                      <li key={e.id}>
                        <button
                          role="checkbox"
                          aria-checked={activo}
                          onClick={() => alternarExtra(e)}
                          className="flex w-full items-center justify-between py-3.5"
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`grid size-6 place-items-center rounded-lg ring-1 transition-colors duration-150 ${
                                activo ? "bg-acento text-white ring-acento" : "ring-borde"
                              }`}
                            >
                              {activo && <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={3} className="animate-pop" />}
                            </span>
                            {e.nombre}
                          </span>
                          <span className="text-sm tabular-nums text-suave">+ Bs {e.precio}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <label htmlFor="nota-producto" className="mt-7 block font-semibold">
              Nota para cocina <span className="font-normal text-suave">(opcional)</span>
            </label>
            <textarea
              id="nota-producto"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              placeholder="Ej: la carne bien cocida"
              className="mt-2 w-full resize-none rounded-xl bg-superficie px-4 py-3 ring-1 ring-borde placeholder:text-suave focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <div className="sticky bottom-0 flex items-center gap-4 border-t border-borde bg-elevada/95 px-5 py-4 backdrop-blur">
            <Contador valor={cantidad} onCambiar={setCantidad} />
            <button
              onClick={() => cerrar(() => onAgregar({ cantidad, extras, quitar, nota: nota.trim() }))}
              className="presionable flex flex-1 items-center justify-between rounded-full bg-acento px-6 py-3.5 font-semibold text-white"
            >
              <span>Agregar</span>
              <span className="tabular-nums">Bs {total}</span>
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
