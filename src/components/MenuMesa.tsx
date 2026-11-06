"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusSignIcon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import {
  categorias,
  menu,
  precioUnitario,
  type Categoria,
  type Extra,
  type ItemCarrito,
  type Producto,
} from "@/data/menu";
import { HugeiconsIcon, IconoCategoria } from "./Icono";
import Encabezado from "./mesa/Encabezado";
import Portada from "./mesa/Portada";
import Destacados from "./mesa/Destacados";
import ProductoSheet from "./mesa/ProductoSheet";
import CarritoSheet from "./mesa/CarritoSheet";
import BuscarSheet from "./mesa/BuscarSheet";
import Pago from "./mesa/Pago";
import PedidoEnviado from "./mesa/PedidoEnviado";
import BarraInferior from "./mesa/BarraInferior";
import Foto from "./mesa/Foto";

const idSeccion = (c: Categoria) => `cat-${c.normalize("NFD").replace(/[^a-zA-Z]/g, "").toLowerCase()}`;
const DURACION_FONDO = 420;

type Enviado = { numero: string; total: number; metodo: "qr" | "caja" };

// mesa = número que trae el QR de la mesa (/mesa/7).
// Si entraron sin QR (al inicio), pueden ver el menú pero no enviar pedidos.
export default function MenuMesa({ mesa }: { mesa: string | null }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [productoAbierto, setProductoAbierto] = useState<Producto | null>(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [buscarAbierto, setBuscarAbierto] = useState(false);
  const [notaGeneral, setNotaGeneral] = useState("");
  const [pagando, setPagando] = useState(false);
  const [enviado, setEnviado] = useState<Enviado | null>(null);
  const [activa, setActiva] = useState<Categoria | null>(null);
  // Efecto iPhone: la página de atrás se encoge mientras hay un panel abierto
  const [fondoAtras, setFondoAtras] = useState(false);
  const [origen, setOrigen] = useState(0);

  const cantidad = carrito.reduce((s, i) => s + i.cantidad, 0);
  const total = carrito.reduce((s, i) => s + precioUnitario(i) * i.cantidad, 0);
  const hayPanel = !!productoAbierto || carritoAbierto || buscarAbierto;
  const atras = hayPanel && fondoAtras;
  const enMenu = !pagando && !enviado;

  // Abre un panel y encoge el fondo desde el centro de lo que se está viendo
  const abrirPanel = (abrir: () => void) => {
    setOrigen(window.scrollY + window.innerHeight / 2);
    setFondoAtras(true);
    abrir();
  };
  const devolverFondo = useCallback(() => setFondoAtras(false), []);

  // Fondo negro detrás de la página mientras está encogida
  useEffect(() => {
    const html = document.documentElement;
    if (atras) {
      html.classList.add("panel-abierto");
      return;
    }
    const t = setTimeout(() => html.classList.remove("panel-abierto"), DURACION_FONDO);
    return () => clearTimeout(t);
  }, [atras]);

  // Marca en la barra de abajo la categoría que el cliente está viendo
  useEffect(() => {
    if (!enMenu) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setActiva(e.target.getAttribute("data-categoria") as Categoria);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    // En la portada no hay ninguna categoría marcada
    const portada = new IntersectionObserver(([e]) => e.isIntersecting && setActiva(null), {
      rootMargin: "0px 0px -60% 0px",
    });
    categorias.forEach((c) => {
      const el = document.getElementById(idSeccion(c));
      if (el) obs.observe(el);
    });
    const p = document.getElementById("portada");
    if (p) portada.observe(p);
    return () => {
      obs.disconnect();
      portada.disconnect();
    };
  }, [enMenu]);

  const irACategoria = (c: Categoria) => document.getElementById(idSeccion(c))?.scrollIntoView({ behavior: "smooth" });

  const agregar = (p: Producto, d: { cantidad: number; extras: Extra[]; quitar: string[]; nota: string }) => {
    const clave = [p.id, ...d.extras.map((e) => e.id).sort(), ...[...d.quitar].sort(), d.nota].join("|");
    setCarrito((c) => {
      const existe = c.find((i) => i.clave === clave);
      if (existe) return c.map((i) => (i.clave === clave ? { ...i, cantidad: i.cantidad + d.cantidad } : i));
      return [...c, { clave, producto: p, ...d }];
    });
    setProductoAbierto(null);
  };

  const cambiarCantidad = (clave: string, n: number) => {
    const nuevo =
      n <= 0 ? carrito.filter((i) => i.clave !== clave) : carrito.map((i) => (i.clave === clave ? { ...i, cantidad: n } : i));
    setCarrito(nuevo);
    if (nuevo.length === 0) setCarritoAbierto(false);
  };

  const irAPago = () => {
    setCarritoAbierto(false);
    setPagando(true);
    window.scrollTo({ top: 0 });
  };

  const terminar = (metodo: Enviado["metodo"]) => {
    // Con la base de datos: aquí guardaremos el pedido (y el método de pago) en Supabase
    const numero = String(Math.floor(100 + Math.random() * 900));
    setEnviado({ numero, total, metodo });
    setPagando(false);
    window.scrollTo({ top: 0 });
  };

  const abrirProducto = (p: Producto) => abrirPanel(() => setProductoAbierto(p));
  const cerrarProducto = useCallback(() => setProductoAbierto(null), []);
  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), []);
  const cerrarBuscar = useCallback(() => setBuscarAbierto(false), []);

  if (enviado && mesa) {
    return (
      <PedidoEnviado
        mesa={mesa}
        numero={enviado.numero}
        total={enviado.total}
        metodo={enviado.metodo}
        onVolver={() => {
          setEnviado(null);
          setCarrito([]);
          setNotaGeneral("");
        }}
      />
    );
  }

  if (pagando && mesa) {
    return (
      <Pago
        mesa={mesa}
        items={carrito}
        total={total}
        onVolver={() => setPagando(false)}
        onPagado={() => terminar("qr")}
        onPagarEnCaja={() => terminar("caja")}
      />
    );
  }

  return (
    <>
      <div
        className="fondo-app min-h-[100svh] bg-fondo"
        data-atras={atras}
        style={{ transformOrigin: `50% ${origen}px` }}
      >
        <div className="mx-auto max-w-xl pb-44">
          <Encabezado mesa={mesa} onBuscar={() => abrirPanel(() => setBuscarAbierto(true))} />

          {!mesa && (
            <p className="mx-5 mb-3 rounded-2xl bg-superficie px-4 py-3 text-sm text-suave">
              Estás viendo el menú. <b className="text-texto">Para pedir, escanea el QR de tu mesa.</b>
            </p>
          )}

          <div id="portada">
            <Portada />
          </div>

          <div id="menu" className="scroll-mt-14">
            <Destacados productos={menu.filter((p) => p.destacado)} onElegir={abrirProducto} />

            {categorias.map((c) => {
              const productos = menu.filter((p) => p.categoria === c);
              return (
                <section key={c} id={idSeccion(c)} data-categoria={c} className="scroll-mt-16 px-5 pt-8">
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
                    <IconoCategoria categoria={c} size={22} strokeWidth={1.8} className="text-acento" />
                    {c}
                  </h2>
                  {productos.length === 0 ? (
                    <p className="py-6 text-suave">Pronto agregaremos productos aquí.</p>
                  ) : (
                    <ul className="mt-1 divide-y divide-borde">
                      {productos.map((p) => {
                        const enCarrito = carrito.filter((i) => i.producto.id === p.id).reduce((s, i) => s + i.cantidad, 0);
                        return (
                          <li key={p.id}>
                            <button onClick={() => abrirProducto(p)} className="presionable flex w-full gap-4 py-4 text-left">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold leading-tight">{p.nombre}</h3>
                                  {p.etiqueta && (
                                    <span className="rounded-full bg-acento-suave px-2 py-0.5 text-[11px] font-semibold text-acento-texto">
                                      {p.etiqueta}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-suave">{p.descripcion}</p>
                                <p className="mt-2 font-semibold tabular-nums">Bs {p.precio}</p>
                              </div>
                              <div className="relative size-24 shrink-0">
                                <Foto src={p.imagen} alt={p.nombre} categoria={p.categoria} sizes="96px" icono={30} className="size-24 rounded-2xl" />
                                {enCarrito > 0 ? (
                                  <span
                                    key={enCarrito}
                                    className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full bg-texto text-sm font-bold tabular-nums text-fondo ring-4 ring-fondo animate-pulso"
                                  >
                                    {enCarrito}
                                  </span>
                                ) : (
                                  <span className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full bg-acento text-white shadow-[0_4px_12px_rgb(var(--sombra-acento)/0.35)] ring-4 ring-fondo">
                                    <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2.4} />
                                  </span>
                                )}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}

            <p className="px-5 pt-12 text-center text-sm text-suave">Vicio, Punata</p>
          </div>
        </div>
      </div>

      {!hayPanel && (
        <>
          {/* Botón del pedido: aparece sobre la barra apenas agregas algo */}
          {cantidad > 0 && (
            <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+90px)] z-40 flex justify-center px-4 animate-asomar">
              <button
                onClick={() => abrirPanel(() => setCarritoAbierto(true))}
                className="presionable pointer-events-auto flex w-full max-w-md items-center justify-between rounded-full bg-acento py-2.5 pl-2.5 pr-5 font-semibold text-white shadow-[0_10px_30px_rgb(var(--sombra-acento)/0.4)]"
              >
                <span className="flex items-center gap-3">
                  <span className="relative grid size-10 place-items-center rounded-full bg-white/20">
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={20} strokeWidth={2} />
                    <span
                      key={cantidad}
                      className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold tabular-nums text-[#c9361f] animate-pulso"
                    >
                      {cantidad}
                    </span>
                  </span>
                  Ver mi pedido
                </span>
                <span className="tabular-nums">Bs {total}</span>
              </button>
            </div>
          )}
          <BarraInferior activa={activa} onElegir={irACategoria} />
        </>
      )}

      {productoAbierto && (
        <ProductoSheet
          key={productoAbierto.id}
          producto={productoAbierto}
          onCerrar={cerrarProducto}
          onCerrando={devolverFondo}
          onAgregar={(d) => agregar(productoAbierto, d)}
        />
      )}

      {carritoAbierto && (
        <CarritoSheet
          mesa={mesa}
          items={carrito}
          notaGeneral={notaGeneral}
          onNotaGeneral={setNotaGeneral}
          onCantidad={cambiarCantidad}
          onCerrar={cerrarCarrito}
          onCerrando={devolverFondo}
          onEnviar={irAPago}
        />
      )}

      {buscarAbierto && (
        <BuscarSheet
          onCerrar={cerrarBuscar}
          onCerrando={devolverFondo}
          onElegir={(p) => {
            setBuscarAbierto(false);
            abrirProducto(p);
          }}
        />
      )}
    </>
  );
}
