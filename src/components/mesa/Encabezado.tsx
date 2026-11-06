"use client";

import Link from "next/link";
import { HugeiconsIcon } from "../Icono";
import { Search01Icon, UserCircleIcon } from "@hugeicons/core-free-icons";

// Barra superior fija: logo (vuelve arriba), mesa, lupa para buscar y acceso del personal
export default function Encabezado({ mesa, onBuscar }: { mesa: string | null; onBuscar: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-fondo/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-5">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver al inicio"
          className="presionable font-display text-xl font-extrabold tracking-tight"
        >
          VICIO<span className="text-acento">.</span>
        </button>
        <div className="flex items-center gap-2">
          {mesa && <span className="rounded-full bg-superficie px-3 py-1.5 text-sm font-semibold">Mesa {mesa}</span>}
          <button
            onClick={onBuscar}
            aria-label="Buscar en el menú"
            className="presionable grid size-10 place-items-center rounded-full bg-superficie"
          >
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.9} />
          </button>
          <Link
            href="/login"
            aria-label="Acceso del personal"
            title="Acceso del personal"
            className="presionable grid size-10 place-items-center rounded-full bg-superficie"
          >
            <HugeiconsIcon icon={UserCircleIcon} size={21} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </header>
  );
}
