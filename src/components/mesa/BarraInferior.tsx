"use client";

import { categorias, type Categoria } from "@/data/menu";
import { IconoCategoria } from "../Icono";

// Nombres cortos para que quepan debajo de cada ícono
const corto: Record<Categoria, string> = {
  Hamburguesas: "Burgers",
  "Pipocas de pollo": "Pipocas",
  Alitas: "Alitas",
  Refrescos: "Refrescos",
  Bebidas: "Bebidas",
};

// Barra flotante estilo Instagram con las categorías del menú
export default function BarraInferior({
  activa,
  onElegir,
}: {
  activa: Categoria | null;
  onElegir: (c: Categoria) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] animate-asomar [animation-delay:300ms]">
      <nav
        aria-label="Categorías del menú"
        className="pointer-events-auto flex w-full max-w-md items-center justify-around rounded-full bg-white/80 px-2 py-1.5 shadow-[0_8px_32px_rgb(0_0_0/0.12)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150"
      >
        {categorias.map((c) => {
          const esActiva = activa === c;
          return (
            <button
              key={c}
              onClick={() => onElegir(c)}
              aria-label={c}
              aria-current={esActiva ? "true" : undefined}
              className={`presionable-barra flex w-16 flex-col items-center gap-0.5 rounded-full py-1.5 transition-colors duration-200 ${
                esActiva ? "text-texto" : "text-suave"
              }`}
            >
              <IconoCategoria categoria={c} size={26} strokeWidth={esActiva ? 2.1 : 1.6} />
              <span className={`text-[10.5px] leading-none ${esActiva ? "font-bold" : "font-medium"}`}>{corto[c]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
