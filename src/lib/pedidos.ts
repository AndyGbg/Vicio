"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import type { ItemCarrito } from "@/data/menu";

// Estados del pedido en la base de datos
// verificar_pago = esperando que caja confirme el pago (10 minutos)
export type EstadoPedido =
  | "verificar_pago"
  | "pagar_en_caja"
  | "en_cocina"
  | "preparando"
  | "listo"
  | "entregado"
  | "cancelado";

export type ItemPedido = {
  id: number;
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  extras: { id: string; nombre: string; precio: number }[];
  quitar: string[];
  nota: string | null;
};

export type Pedido = {
  id: string;
  numero: number;
  mesa: number;
  estado: EstadoPedido;
  total: number;
  nota: string | null;
  creado: string;
  vence_en: string | null;
  pagado_en: string | null;
  cancelado_motivo: string | null;
  pedido_items: ItemPedido[];
};

// ---------- Cliente ----------

export type PedidoCreado = { pedido_id: string; numero: number; total: number; vence_en: string };

// Crea el pedido en la base de datos (el precio lo calcula el servidor)
export async function crearPedido(mesa: string, codigo: string, items: ItemCarrito[], nota: string) {
  const { data, error } = await supabase().rpc("crear_pedido", {
    p_mesa: Number(mesa),
    p_codigo: codigo,
    p_items: items.map((i) => ({
      producto_id: i.producto.id,
      cantidad: i.cantidad,
      extras: i.extras.map((e) => e.id),
      quitar: i.quitar,
      nota: i.nota,
    })),
    p_nota: nota || null,
  });
  if (error) throw new Error(limpiarError(error.message));
  const fila = (data as PedidoCreado[] | null)?.[0];
  if (!fila) throw new Error("No se pudo crear el pedido. Intenta de nuevo.");
  return { ...fila, total: Number(fila.total) };
}

export type EstadoCliente = {
  numero: number;
  mesa: number;
  estado: EstadoPedido;
  total: number;
  vence_en: string | null;
  pagado_en: string | null;
  cancelado_motivo: string | null;
};

// El cliente consulta su pedido (si pasaron los 10 minutos sin pago, se cancela)
export async function consultarPedido(id: string): Promise<EstadoCliente | null> {
  const { data, error } = await supabase().rpc("consultar_pedido", { p_id: id });
  if (error) throw new Error(limpiarError(error.message));
  const fila = (data as EstadoCliente[] | null)?.[0];
  return fila ? { ...fila, total: Number(fila.total) } : null;
}

export async function validarMesa(mesa: string, codigo: string) {
  const { data, error } = await supabase().rpc("validar_mesa", { p_mesa: Number(mesa), p_codigo: codigo });
  if (error) return false;
  return data === true;
}

function limpiarError(msg: string) {
  return msg.replace(/^.*?ERROR:\s*/i, "").trim() || "Ocurrió un error. Intenta de nuevo.";
}

// ---------- Personal (caja y cocina) ----------

// Trae los pedidos de las últimas horas y se mantiene actualizado en vivo
export function usePedidosEnVivo(horas = 12) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const ultimaCarga = useRef(0);

  const cargar = useCallback(async () => {
    ultimaCarga.current = Date.now();
    const desde = new Date(Date.now() - horas * 3600_000).toISOString();
    const { data, error } = await supabase()
      .from("pedidos")
      .select("*, pedido_items(*)")
      .gte("creado", desde)
      .order("creado", { ascending: true });
    if (error) setError(error.message);
    else {
      setError("");
      setPedidos(
        ((data ?? []) as Pedido[]).map((p) => ({
          ...p,
          total: Number(p.total),
          pedido_items: [...(p.pedido_items ?? [])].sort((a, b) => a.id - b.id),
        }))
      );
    }
    setCargando(false);
  }, [horas]);

  useEffect(() => {
    cargar();
    // En vivo: cada cambio en la tabla pedidos vuelve a cargar la lista
    const sb = supabase();
    const canal = sb
      .channel("pedidos-en-vivo")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => cargar())
      .subscribe();
    // Respaldo por si se corta la conexión en vivo
    const intervalo = setInterval(() => {
      if (Date.now() - ultimaCarga.current > 15000) cargar();
    }, 5000);
    return () => {
      sb.removeChannel(canal);
      clearInterval(intervalo);
    };
  }, [cargar]);

  return { pedidos, cargando, error, recargar: cargar };
}

// Cambia el estado de un pedido (caja o cocina, según sus permisos)
export async function actualizarPedido(id: string, cambios: Partial<Pick<Pedido, "estado" | "pagado_en" | "cancelado_motivo">>) {
  const { error } = await supabase().from("pedidos").update(cambios).eq("id", id);
  if (error) throw new Error(limpiarError(error.message));
}

// ---------- Tiempo ----------

// Hook que devuelve la hora actual y se actualiza cada "cadaMs"
export function useAhora(cadaMs = 1000) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), cadaMs);
    return () => clearInterval(t);
  }, [cadaMs]);
  return ahora;
}

export function haceCuanto(fecha: string | null, ahora: number) {
  if (!fecha) return "";
  const min = Math.floor((ahora - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h ${min % 60} min`;
}

export function cuentaRegresiva(hasta: string | null, ahora: number) {
  if (!hasta) return { texto: "--:--", segundos: 0 };
  const s = Math.max(0, Math.floor((new Date(hasta).getTime() - ahora) / 1000));
  const texto = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { texto, segundos: s };
}

export function detalleItem(i: Pick<ItemPedido, "extras" | "quitar">) {
  return [...(i.quitar ?? []), ...(i.extras ?? []).map((e) => `+ ${e.nombre}`)].join(", ");
}
