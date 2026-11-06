"use client";

import { useEffect, useRef, useState } from "react";
import { actualizarPedido, haceCuanto, useAhora, usePedidosEnVivo, type Pedido } from "@/lib/pedidos";
import TarjetaPedido, { Boton, Columna } from "./TarjetaPedido";

const MINUTOS_ALERTA = 15; // a partir de aquí el tiempo se pinta en rojo

// Panel de cocina: solo ve pedidos ya pagados (la base de datos no le muestra otros)
export default function Cocina() {
  const { pedidos, cargando, error } = usePedidosEnVivo(12);
  const ahora = useAhora(15000);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState("");
  const [sonido, setSonido] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const vistos = useRef<Set<string> | null>(null);

  // Más antiguo primero (según cuándo se confirmó el pago)
  const porPago = (a: Pedido, b: Pedido) => (a.pagado_en ?? a.creado).localeCompare(b.pagado_en ?? b.creado);
  const nuevos = pedidos.filter((p) => p.estado === "en_cocina").sort(porPago);
  const preparando = pedidos.filter((p) => p.estado === "preparando").sort(porPago);
  const listos = pedidos.filter((p) => p.estado === "listo").sort(porPago);

  // Suena un "ding" cuando llega un pedido nuevo
  useEffect(() => {
    if (cargando) return;
    const ids = new Set(nuevos.map((p) => p.id));
    if (vistos.current && sonido && audio.current) {
      const hayNuevo = [...ids].some((id) => !vistos.current!.has(id));
      if (hayNuevo) ding(audio.current);
    }
    vistos.current = ids;
  }, [nuevos, cargando, sonido]);

  const activarSonido = () => {
    try {
      audio.current = audio.current ?? new AudioContext();
      ding(audio.current);
      setSonido(true);
    } catch {
      /* el navegador no permite sonido */
    }
  };

  const cambiar = async (p: Pedido, estado: "preparando" | "listo") => {
    setOcupado(p.id);
    setErrorAccion("");
    try {
      await actualizarPedido(p.id, { estado });
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "No se pudo guardar el cambio");
    } finally {
      setOcupado(null);
    }
  };

  const tiempo = (p: Pedido) => {
    const min = p.pagado_en ? (ahora - new Date(p.pagado_en).getTime()) / 60000 : 0;
    return (
      <span className={`text-base font-bold tabular-nums ${min >= MINUTOS_ALERTA ? "text-acento-texto" : ""}`}>
        {haceCuanto(p.pagado_en, ahora)}
      </span>
    );
  };

  if (cargando) return <p className="text-suave">Cargando pedidos...</p>;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-suave">Solo aparecen los pedidos con el pago confirmado por caja. Se actualiza solo.</p>
        <button
          onClick={activarSonido}
          className={`presionable rounded-full px-5 py-2.5 text-sm font-semibold ${sonido ? "bg-superficie ring-1 ring-borde" : "bg-texto text-fondo"}`}
        >
          {sonido ? "Sonido activado" : "Activar sonido de pedidos"}
        </button>
      </div>

      {(error || errorAccion) && (
        <p role="alert" className="mb-4 rounded-xl bg-acento-suave px-4 py-3 text-sm text-acento-texto">
          {errorAccion || `Error de conexión: ${error}`}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Columna titulo="Nuevos" cantidad={nuevos.length} vacio="Sin pedidos nuevos.">
          {nuevos.map((p) => (
            <TarjetaPedido key={p.id} pedido={p} grande resaltado arriba={tiempo(p)}>
              <Boton tipo="principal" onClick={() => cambiar(p, "preparando")} deshabilitado={ocupado === p.id}>
                Empezar
              </Boton>
            </TarjetaPedido>
          ))}
        </Columna>
        <Columna titulo="Preparando" cantidad={preparando.length} vacio="Nada en preparación.">
          {preparando.map((p) => (
            <TarjetaPedido key={p.id} pedido={p} grande arriba={tiempo(p)}>
              <Boton tipo="principal" onClick={() => cambiar(p, "listo")} deshabilitado={ocupado === p.id}>
                Listo
              </Boton>
            </TarjetaPedido>
          ))}
        </Columna>
        <Columna titulo="Listos para llevar" cantidad={listos.length} vacio="Nada esperando.">
          {listos.map((p) => (
            <TarjetaPedido key={p.id} pedido={p} arriba={tiempo(p)}>
              <p className="w-full text-sm text-suave">Esperando que lo lleven a la mesa {p.mesa}.</p>
            </TarjetaPedido>
          ))}
        </Columna>
      </div>
    </>
  );
}

// Un "ding" corto generado por el navegador (no necesita archivo de audio)
function ding(ctx: AudioContext) {
  const t = ctx.currentTime;
  [880, 1320].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, t + i * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.3, t + i * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + i * 0.18);
    osc.stop(t + i * 0.18 + 0.4);
  });
}
