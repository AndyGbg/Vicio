"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

type Mesa = { numero: number; codigo: string; activa: boolean };

const nuevoCodigo = () => Math.random().toString(36).slice(2, 8);

// Pestaña Mesas: un QR por mesa (número + código secreto), listo para imprimir
export default function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [qrs, setQrs] = useState<Record<number, string>>({});
  const [origen, setOrigen] = useState("");
  const [copiado, setCopiado] = useState<number | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    const { data, error } = await supabase().from("mesas").select("numero, codigo, activa").order("numero");
    if (error) setError(error.message);
    else setMesas((data ?? []) as Mesa[]);
  }, []);

  useEffect(() => {
    setOrigen(window.location.origin);
    cargar();
  }, [cargar]);

  const enlace = useCallback((m: Mesa) => `${origen}/mesa/${m.numero}?c=${m.codigo}`, [origen]);

  // Genera la imagen de cada QR
  useEffect(() => {
    if (!origen) return;
    Promise.all(
      mesas.map(async (m) => [m.numero, await QRCode.toDataURL(enlace(m), { margin: 1, width: 360 })] as const)
    ).then((lista) => setQrs(Object.fromEntries(lista)));
  }, [mesas, origen, enlace]);

  const copiar = async (m: Mesa) => {
    try {
      await navigator.clipboard.writeText(enlace(m));
      setCopiado(m.numero);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      /* el navegador no dejó copiar */
    }
  };

  const cambiarCodigo = async (m: Mesa) => {
    const { error } = await supabase().from("mesas").update({ codigo: nuevoCodigo() }).eq("numero", m.numero);
    if (error) setError(error.message);
    else cargar();
  };

  const esLocal = origen.includes("localhost") || origen.includes("127.0.0.1");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="max-w-2xl text-sm text-suave">
          Cada QR lleva el número de la mesa y su código secreto. Si alguien comparte la foto de un QR, toca{" "}
          <b className="text-texto">Cambiar código</b> e imprime el nuevo (el viejo deja de funcionar).
        </p>
        <button onClick={() => window.print()} className="presionable rounded-full bg-texto px-5 py-2.5 text-sm font-semibold text-fondo">
          Imprimir todos
        </button>
      </div>

      {esLocal && (
        <p className="mb-6 rounded-xl bg-acento-suave px-4 py-3 text-sm text-acento-texto print:hidden">
          Estos QR apuntan a <b>localhost</b>, así que solo funcionan en esta compu. Para imprimir los definitivos, ábrelos
          desde la página publicada en Vercel.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-acento-texto">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 print:grid-cols-3">
        {mesas.map((m) => (
          <article key={m.numero} className="break-inside-avoid rounded-2xl bg-fondo p-4 text-center ring-1 ring-borde">
            <p className="font-display text-xl font-extrabold tracking-tight">
              VICIO<span className="text-acento">.</span>
            </p>
            {qrs[m.numero] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrs[m.numero]} alt={`QR de la mesa ${m.numero}`} className="mx-auto mt-2 aspect-square w-full max-w-44" />
            ) : (
              <div className="mx-auto mt-2 aspect-square w-full max-w-44 rounded-xl bg-superficie" />
            )}
            <p className="mt-2 font-display text-3xl font-bold">Mesa {m.numero}</p>
            <p className="text-xs text-suave">Escanea para pedir</p>
            <div className="mt-3 flex flex-col gap-1.5 print:hidden">
              <button onClick={() => copiar(m)} className="presionable rounded-full bg-superficie py-1.5 text-xs font-semibold">
                {copiado === m.numero ? "¡Copiado!" : "Copiar link"}
              </button>
              <a href={enlace(m)} target="_blank" rel="noreferrer" className="presionable rounded-full bg-superficie py-1.5 text-xs font-semibold">
                Abrir como cliente
              </a>
              <button onClick={() => cambiarCodigo(m)} className="text-xs text-suave underline underline-offset-4 decoration-borde">
                Cambiar código
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
