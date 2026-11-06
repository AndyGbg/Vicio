"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "../Icono";
import { Download04Icon, QrCodeIcon, Tick02Icon, Clock01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { consultarPedido, cuentaRegresiva, useAhora, type EstadoCliente } from "@/lib/pedidos";

// QR de cobro de Yasta del Vicio: guarda la imagen en public/qr-pago.png
const QR_PAGO = "/qr-pago.png";
const CADA_CUANTO = 4000; // cada 4 segundos revisa si la caja confirmó

const pasos = [
  { estados: ["en_cocina"], texto: "Pago confirmado" },
  { estados: ["preparando"], texto: "Preparando tu pedido" },
  { estados: ["listo"], texto: "Listo, va a tu mesa" },
  { estados: ["entregado"], texto: "Entregado. ¡Buen provecho!" },
];
const orden = ["en_cocina", "preparando", "listo", "entregado"];

// Todo lo que pasa después de que el cliente confirma su pedido:
// esperando pago (QR + 10 minutos) -> seguimiento en vivo -> o cancelado
export default function Pago({
  pedidoId,
  mesa,
  onNuevoPedido,
}: {
  pedidoId: string;
  mesa: string;
  onNuevoPedido: () => void;
}) {
  const [info, setInfo] = useState<EstadoCliente | null>(null);
  const [sinQr, setSinQr] = useState(false);
  const [errorRed, setErrorRed] = useState(false);
  const ahora = useAhora(1000);

  const revisar = useCallback(async () => {
    try {
      const r = await consultarPedido(pedidoId);
      setInfo(r);
      setErrorRed(false);
    } catch {
      setErrorRed(true);
    }
  }, [pedidoId]);

  useEffect(() => {
    revisar();
    const t = setInterval(revisar, CADA_CUANTO);
    return () => clearInterval(t);
  }, [revisar]);

  const reloj = cuentaRegresiva(info?.vence_en ?? null, ahora);

  // Cuando el contador llega a 0, preguntamos de inmediato (la base de datos lo cancela)
  useEffect(() => {
    if (info?.estado === "verificar_pago" && reloj.segundos === 0) revisar();
  }, [info?.estado, reloj.segundos, revisar]);

  if (!info) {
    return (
      <main className="grid min-h-[100svh] place-items-center text-suave" aria-busy="true">
        {errorRed ? "Sin conexión. Reintentando..." : "Cargando tu pedido..."}
      </main>
    );
  }

  // ---------- Cancelado ----------
  if (info.estado === "cancelado") {
    const vencido = info.cancelado_motivo !== "rechazado";
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center px-6 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-superficie text-suave animate-pop">
          <HugeiconsIcon icon={vencido ? Clock01Icon : Cancel01Icon} size={36} strokeWidth={1.8} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
          {vencido ? "Se acabó el tiempo para pagar" : "No pudimos confirmar tu pago"}
        </h1>
        <p className="mx-auto mt-3 max-w-[34ch] text-suave">
          El pedido #{info.numero} fue cancelado y no llegó a cocina.{" "}
          <b className="text-texto">Si ya pagaste, acércate a caja con tu comprobante</b> y lo activamos.
        </p>
        <button
          onClick={onNuevoPedido}
          className="presionable mx-auto mt-8 rounded-full bg-acento px-8 py-4 font-semibold text-white"
        >
          Hacer un nuevo pedido
        </button>
      </main>
    );
  }

  // ---------- Esperando pago ----------
  if (info.estado === "verificar_pago" || info.estado === "pagar_en_caja") {
    const urgente = reloj.segundos < 120;
    return (
      <main className="mx-auto min-h-[100svh] max-w-xl px-5 pb-10 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="text-center font-display text-2xl font-bold tracking-tight">Paga con Yasta o tu banco</h1>
        <p className="mt-1 text-center text-suave">Cuando caja vea tu pago, tu pedido pasa a cocina.</p>

        <div className="mx-auto mt-6 w-full max-w-[17rem] rounded-2xl bg-superficie p-4 text-center animate-entrar">
          <p className="text-sm text-suave">Total a pagar</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">Bs {info.total}</p>
          <p className="mt-1 text-sm text-suave">Pedido #{info.numero}</p>
        </div>

        <div className="mx-auto mt-5 w-full max-w-[17rem] rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0_0_0/0.08)] ring-1 ring-borde animate-entrar [animation-delay:60ms]">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-superficie">
            {!sinQr ? (
              <Image src={QR_PAGO} alt="QR de Yasta para pagar al Vicio" fill sizes="272px" className="object-contain" onError={() => setSinQr(true)} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-suave">
                <HugeiconsIcon icon={QrCodeIcon} size={56} strokeWidth={1.3} className="text-[#c4c4c0]" />
                <p className="text-sm">Aquí irá el QR de Yasta del Vicio</p>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold">Mesa {mesa}</span>
            <span className={`flex items-center gap-1.5 font-semibold tabular-nums ${urgente ? "text-acento-texto" : ""}`}>
              <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={2} />
              {reloj.texto}
            </span>
          </div>
        </div>

        <a
          href={QR_PAGO}
          download="qr-yasta-vicio.png"
          aria-disabled={sinQr}
          className={`presionable mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-acento px-6 py-3 font-semibold text-white ${
            sinQr ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <HugeiconsIcon icon={Download04Icon} size={20} strokeWidth={2} />
          Descargar QR
        </a>

        <ol className="mt-8 space-y-3">
          {[
            "Descarga el QR.",
            "Abre Yasta o la app de tu banco y paga con QR desde la galería.",
            `Paga Bs ${info.total} exactos.`,
          ].map((p, i) => (
            <li key={p} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-superficie text-sm font-bold">{i + 1}</span>
              <span className="pt-0.5 text-suave">{p}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-superficie p-4" role="status">
          <span className="relative flex size-3 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-acento opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-3 rounded-full bg-acento" />
          </span>
          <p className="text-sm">
            <b>Esperando que caja confirme tu pago.</b>{" "}
            <span className="text-suave">Tienes {reloj.texto} para pagar. No cierres esta página.</span>
          </p>
        </div>
      </main>
    );
  }

  // ---------- Seguimiento en vivo (pagado) ----------
  const actual = orden.indexOf(info.estado);
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col justify-center px-6">
      <div className="text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-acento text-white shadow-[0_10px_30px_rgb(var(--sombra-acento)/0.35)] animate-pop">
          <HugeiconsIcon icon={Tick02Icon} size={40} strokeWidth={2.6} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
          {info.estado === "entregado" ? "¡Buen provecho!" : "¡Pago confirmado!"}
        </h1>
        <p className="mt-2 text-suave">
          Pedido <b className="text-texto">#{info.numero}</b> para la mesa {mesa}, Bs {info.total}
        </p>
      </div>

      <ol className="mt-10 rounded-2xl bg-superficie p-5" aria-live="polite">
        {pasos.map((p, idx) => {
          const hecho = idx <= actual;
          const enCurso = idx === actual && info.estado !== "entregado";
          return (
            <li key={p.texto} className="flex items-center gap-4 py-2.5">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                  hecho ? "bg-acento text-white" : "text-suave ring-1 ring-borde"
                }`}
              >
                {hecho ? <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.8} /> : idx + 1}
              </span>
              <span className={hecho ? "font-semibold" : "text-suave"}>{p.texto}</span>
              {enCurso && <span className="ml-auto text-xs font-semibold text-acento-texto">Ahora</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm text-suave">Esta pantalla se actualiza sola.</p>

      <button onClick={onNuevoPedido} className="presionable mt-8 rounded-full bg-superficie py-4 font-semibold ring-1 ring-borde">
        Pedir algo más
      </button>
    </main>
  );
}
