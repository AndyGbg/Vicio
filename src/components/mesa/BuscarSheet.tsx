"use client";

import { useMemo, useState } from "react";
import { menu, type Producto } from "@/data/menu";
import { HugeiconsIcon } from "../Icono";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Sheet from "./Sheet";
import Foto from "./Foto";

// Quita tildes y mayúsculas para que "limon" encuentre "Limonada"
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function BuscarSheet({
  onCerrar,
  onCerrando,
  onElegir,
}: {
  onCerrar: () => void;
  onCerrando: () => void;
  onElegir: (p: Producto) => void;
}) {
  const [texto, setTexto] = useState("");

  const resultados = useMemo(() => {
    const q = normalizar(texto.trim());
    if (!q) return menu;
    return menu.filter((p) => normalizar(`${p.nombre} ${p.descripcion} ${p.categoria}`).includes(q));
  }, [texto]);

  return (
    <Sheet onCerrar={onCerrar} onCerrando={onCerrando} etiqueta="Buscar en el menú">
      {(cerrar) => (
        <div className="px-5 pb-8">
          <div className="sticky top-8 z-10 -mx-5 bg-elevada px-5 pb-3">
            <label htmlFor="buscar" className="sr-only">
              Buscar en el menú
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-superficie px-3.5 focus-within:ring-2 focus-within:ring-acento">
              <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.8} className="text-suave" />
              <input
                id="buscar"
                autoFocus
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Hamburguesa, alitas, mini..."
                className="h-12 flex-1 bg-transparent placeholder:text-suave focus:outline-none focus-visible:outline-none"
              />
              {texto && (
                <button aria-label="Borrar búsqueda" onClick={() => setTexto("")} className="presionable text-suave">
                  <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {resultados.length === 0 ? (
            <p className="py-12 text-center text-suave">
              No encontramos &quot;{texto}&quot;. Prueba con otra palabra.
            </p>
          ) : (
            <ul className="divide-y divide-borde">
              {resultados.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => cerrar(() => onElegir(p))}
                    className="presionable flex w-full items-center gap-3 py-3 text-left"
                  >
                    <Foto src={p.imagen} alt={p.nombre} categoria={p.categoria} sizes="48px" icono={20} className="size-12 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{p.nombre}</p>
                      <p className="text-sm text-suave">{p.categoria}</p>
                    </div>
                    <span className="font-semibold tabular-nums">Bs {p.precio}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Sheet>
  );
}
