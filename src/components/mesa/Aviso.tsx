"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "../Icono";
import { Tick02Icon } from "@hugeicons/core-free-icons";

export type DatosAviso = { id: number; texto: string; tipo?: "ok" | "info" };

// Aviso flotante tipo iPhone que aparece sobre la barra y se va solo
export default function Aviso({ aviso, onTerminar }: { aviso: DatosAviso; onTerminar: () => void }) {
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSaliendo(true), 2200);
    const t2 = setTimeout(onTerminar, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onTerminar]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-40 flex justify-center px-4"
    >
      <div
        className={`flex items-center gap-2.5 rounded-full bg-texto py-2.5 ${aviso.tipo === "info" ? "pl-5" : "pl-3"} pr-5 text-sm font-medium text-fondo shadow-[0_8px_24px_rgb(0_0_0/0.2)] ${
          saliendo ? "animate-desaparecer" : "animate-asomar"
        }`}
      >
        {aviso.tipo !== "info" && (
          <span className="grid size-6 place-items-center rounded-full bg-acento text-white">
            <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={3} />
          </span>
        )}
        {aviso.texto}
      </div>
    </div>
  );
}
