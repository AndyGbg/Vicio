"use client";

import Image from "next/image";
import { useState } from "react";
import { HugeiconsIcon } from "../Icono";
import { ArrowLeft01Icon, Download04Icon, QrCodeIcon } from "@hugeicons/core-free-icons";
import { precioUnitario, type ItemCarrito } from "@/data/menu";

// QR de cobro del Vicio: guarda la imagen del QR de su banco en public/qr-pago.png
const QR_PAGO = "/qr-pago.png";

const pasos = [
  "Descarga el QR con el botón de arriba.",
  "Abre la app de tu banco y elige pagar con QR desde la galería.",
  "Paga el total exacto y vuelve aquí.",
];

export default function Pago({
  mesa,
  items,
  total,
  onVolver,
  onPagado,
  onPagarEnCaja,
}: {
  mesa: string;
  items: ItemCarrito[];
  total: number;
  onVolver: () => void;
  onPagado: () => void;
  onPagarEnCaja: () => void;
}) {
  const [sinQr, setSinQr] = useState(false);
  const cantidad = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <main className="mx-auto min-h-[100svh] max-w-xl pb-10">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-fondo/85 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <button
          onClick={onVolver}
          aria-label="Volver al pedido"
          className="presionable grid size-10 place-items-center rounded-full bg-superficie"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2} />
        </button>
        <h1 className="font-display text-lg font-bold tracking-tight">Pagar con QR</h1>
      </header>

      <div className="px-5">
        <div className="mt-4 text-center animate-entrar">
          <p className="text-suave">
            Mesa {mesa}, {cantidad} {cantidad === 1 ? "producto" : "productos"}
          </p>
          <p className="mt-1 font-display text-5xl font-bold tabular-nums tracking-tight">Bs {total}</p>
        </div>

        {/* Tarjeta del QR */}
        <div className="mx-auto mt-6 w-full max-w-[18rem] rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0_0_0/0.08)] ring-1 ring-borde animate-entrar [animation-delay:80ms]">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-superficie">
            {!sinQr ? (
              <Image
                src={QR_PAGO}
                alt="Código QR para pagar al Vicio"
                fill
                sizes="288px"
                className="object-contain"
                onError={() => setSinQr(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-suave">
                <HugeiconsIcon icon={QrCodeIcon} size={56} strokeWidth={1.3} className="text-[#c4c4c0]" />
                <p className="text-sm">Aquí irá el QR de cobro del Vicio</p>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-sm font-semibold">Vicio, Punata</p>
        </div>

        <a
          href={QR_PAGO}
          download="qr-pago-vicio.png"
          aria-disabled={sinQr}
          className={`presionable mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-superficie px-5 py-3 font-semibold animate-entrar [animation-delay:120ms] ${
            sinQr ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <HugeiconsIcon icon={Download04Icon} size={20} strokeWidth={2} />
          Descargar QR
        </a>

        <h2 className="mt-8 font-semibold">Cómo pagar desde tu celular</h2>
        <ol className="mt-3 space-y-3">
          {pasos.map((p, i) => (
            <li key={p} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-acento-suave text-sm font-bold text-acento-texto">
                {i + 1}
              </span>
              <span className="pt-0.5 text-suave">{p}</span>
            </li>
          ))}
        </ol>

        <details className="mt-6 rounded-2xl bg-superficie px-4 py-3 text-sm">
          <summary className="cursor-pointer font-semibold">Ver mi pedido</summary>
          <ul className="mt-2 space-y-1.5 text-suave">
            {items.map((i) => (
              <li key={i.clave} className="flex justify-between gap-3">
                <span>
                  {i.cantidad} x {i.producto.nombre}
                </span>
                <span className="tabular-nums">Bs {precioUnitario(i) * i.cantidad}</span>
              </li>
            ))}
          </ul>
        </details>

        <button
          onClick={onPagado}
          className="presionable mt-8 w-full rounded-full bg-acento py-4 text-lg font-semibold text-white shadow-[0_8px_24px_rgb(var(--sombra-acento)/0.32)]"
        >
          Ya pagué, enviar pedido
        </button>
        <p className="mt-2 text-center text-sm text-suave">El personal confirma tu pago antes de prepararlo.</p>

        <button onClick={onPagarEnCaja} className="mx-auto mt-5 block text-sm font-semibold text-suave underline underline-offset-4 decoration-borde">
          Prefiero pagar en caja
        </button>
      </div>
    </main>
  );
}
