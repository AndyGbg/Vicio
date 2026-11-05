import type { Producto } from "@/data/menu";
import Foto from "./Foto";

export default function Destacados({
  productos,
  onElegir,
}: {
  productos: Producto[];
  onElegir: (p: Producto) => void;
}) {
  return (
    <section className="pt-2">
      <h2 className="px-5 font-display text-2xl font-bold tracking-tight">Lo más pedido</h2>
      <div className="sin-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2">
        {productos.map((p) => (
          <button
            key={p.id}
            onClick={() => onElegir(p)}
            className="presionable w-40 shrink-0 snap-start text-left"
          >
            <div className="relative">
              <Foto src={p.imagen} alt={p.nombre} categoria={p.categoria} sizes="160px" className="aspect-square rounded-xl" />
              {p.etiqueta && (
                <span className="absolute left-2 top-2 rounded-full bg-acento px-2 py-0.5 text-[11px] font-semibold text-white">
                  {p.etiqueta}
                </span>
              )}
            </div>
            <p className="mt-2.5 font-semibold leading-tight">{p.nombre}</p>
            <p className="mt-1 font-semibold tabular-nums text-acento-texto">Bs {p.precio}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
