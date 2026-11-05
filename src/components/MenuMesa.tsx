"use client";

import { useMemo, useState } from "react";
import { menu, type Producto } from "@/data/menu";

const categorias = ["Hamburguesas", "Acompañantes", "Bebidas"] as const;

export default function MenuMesa({ mesa }: { mesa: string }) {
  const [categoria, setCategoria] = useState<(typeof categorias)[number]>("Hamburguesas");
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [abierto, setAbierto] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const items = useMemo(
    () =>
      Object.entries(carrito)
        .filter(([, n]) => n > 0)
        .map(([id, n]) => ({ p: menu.find((m) => m.id === id)!, n })),
    [carrito]
  );
  const total = items.reduce((s, { p, n }) => s + p.precio * n, 0);
  const cantidad = items.reduce((s, { n }) => s + n, 0);

  const cambiar = (p: Producto, d: number) =>
    setCarrito((c) => ({ ...c, [p.id]: Math.max(0, (c[p.id] ?? 0) + d) }));

  if (enviado) {
    return (
      <main className="min-h-dvh grid place-items-center p-6 text-center">
        <div>
          <div className="text-7xl mb-4">🔥</div>
          <h1 className="font-display text-3xl font-extrabold">¡Pedido enviado!</h1>
          <p className="text-humo mt-2">Mesa {mesa} · Ya lo estamos preparando.</p>
          <p className="text-humo text-sm mt-6">
            (Por ahora es una demo: en el Paso 3 el pedido llegará de verdad a cocina.)
          </p>
          <button
            onClick={() => { setEnviado(false); setCarrito({}); setAbierto(false); }}
            className="mt-8 rounded-full bg-mostaza text-carbon font-semibold px-6 py-3"
          >
            Pedir algo más
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh pb-32 max-w-xl mx-auto">
      <header className="px-5 pt-8 pb-4">
        <p className="text-humo text-sm">Mesa {mesa} · Punata</p>
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          VICIO<span className="text-ketchup">.</span>
        </h1>
        <p className="text-humo mt-1">¿Qué se te antoja hoy?</p>
      </header>

      <nav className="sticky top-0 z-10 bg-carbon/90 backdrop-blur px-5 py-3 flex gap-2 overflow-x-auto">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCategoria(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              categoria === c ? "bg-mostaza text-carbon" : "bg-brasa text-crema border border-borde"
            }`}
          >
            {c}
          </button>
        ))}
      </nav>

      <ul className="px-5 mt-2 space-y-3">
        {menu.filter((p) => p.categoria === categoria).map((p) => {
          const n = carrito[p.id] ?? 0;
          return (
            <li key={p.id} className="flex gap-4 rounded-2xl bg-brasa border border-borde p-4">
              <div className="grid place-items-center size-20 shrink-0 rounded-xl bg-carbon text-4xl">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-lg leading-tight">{p.nombre}</h2>
                <p className="text-humo text-sm mt-1">{p.descripcion}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold text-mostaza">Bs {p.precio}</span>
                  {n === 0 ? (
                    <button
                      onClick={() => cambiar(p, 1)}
                      className="rounded-full bg-ketchup px-4 py-1.5 text-sm font-semibold active:scale-95 transition"
                    >
                      Agregar
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => cambiar(p, -1)} className="size-8 rounded-full bg-carbon border border-borde">−</button>
                      <span className="w-4 text-center font-semibold">{n}</span>
                      <button onClick={() => cambiar(p, 1)} className="size-8 rounded-full bg-ketchup">+</button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {cantidad > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4">
          <div className="max-w-xl mx-auto">
            {abierto && (
              <div className="mb-3 rounded-2xl bg-brasa border border-borde p-4 space-y-2">
                {items.map(({ p, n }) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span>{n} × {p.nombre}</span>
                    <span className="text-humo">Bs {p.precio * n}</span>
                  </div>
                ))}
                <button
                  onClick={() => setEnviado(true)}
                  className="w-full mt-3 rounded-xl bg-mostaza text-carbon font-bold py-3"
                >
                  Enviar pedido a cocina · Bs {total}
                </button>
              </div>
            )}
            <button
              onClick={() => setAbierto((a) => !a)}
              className="w-full flex justify-between items-center rounded-2xl bg-ketchup px-5 py-4 font-semibold shadow-lg shadow-ketchup/30"
            >
              <span>🛒 {cantidad} {cantidad === 1 ? "producto" : "productos"}</span>
              <span>{abierto ? "Cerrar" : `Ver pedido · Bs ${total}`}</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
