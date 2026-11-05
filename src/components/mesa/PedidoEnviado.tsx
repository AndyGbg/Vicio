"use client";

import { HugeiconsIcon } from "../Icono";
import { Tick02Icon } from "@hugeicons/core-free-icons";

const pasosPorMetodo = {
  qr: ["Pago enviado, lo estamos verificando", "En preparación", "Listo, va a tu mesa"],
  caja: ["Pedido recibido, acércate a caja a pagar", "En preparación", "Listo, va a tu mesa"],
};

export default function PedidoEnviado({
  mesa,
  numero,
  total,
  metodo,
  onVolver,
}: {
  mesa: string;
  numero: string;
  total: number;
  metodo: "qr" | "caja";
  onVolver: () => void;
}) {
  const pasos = pasosPorMetodo[metodo];
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center px-6">
      <div className="text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-acento text-white shadow-[0_10px_30px_rgb(var(--sombra-acento)/0.35)] animate-pop">
          <HugeiconsIcon icon={Tick02Icon} size={40} strokeWidth={2.6} />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight animate-entrar [animation-delay:80ms]">
          ¡Pedido enviado!
        </h1>
        <p className="mt-2 text-suave animate-entrar [animation-delay:140ms]">
          Pedido <span className="font-semibold text-texto">#{numero}</span> para la mesa {mesa}, total{" "}
          <span className="tabular-nums">Bs {total}</span>
        </p>
      </div>

      <ol className="mt-10 rounded-2xl bg-superficie p-5 ring-1 ring-borde animate-entrar [animation-delay:200ms]">
        {pasos.map((p, idx) => (
          <li key={p} className="flex items-center gap-4 py-2.5">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                idx === 0 ? "bg-acento text-white" : "text-suave ring-1 ring-borde"
              }`}
            >
              {idx === 0 ? <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.8} /> : idx + 1}
            </span>
            <span className={idx === 0 ? "font-semibold" : "text-suave"}>{p}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center text-sm text-suave">
        Demo: cuando conectemos la base de datos, este estado cambiará en vivo desde cocina.
      </p>

      <button
        onClick={onVolver}
        className="presionable mt-8 rounded-full bg-superficie py-4 font-semibold ring-1 ring-borde"
      >
        Pedir algo más
      </button>
    </main>
  );
}
