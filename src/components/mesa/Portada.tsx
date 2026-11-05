import { HugeiconsIcon } from "../Icono";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import Foto from "./Foto";

// Pantalla de bienvenida (el logo, la mesa y la lupa están en el Encabezado)
export default function Portada() {
  return (
    <section className="relative flex flex-col px-5 pb-24 pt-2">
      {/* Foto principal: public/portada.jpg (idealmente 1600 x 1200 o más) */}
      <Foto
        src="/portada.jpg"
        alt="Hamburguesa estrella del Vicio"
        sizes="(max-width: 576px) 100vw, 576px"
        icono={56}
        priority
        className="aspect-[4/3] w-full rounded-3xl animate-entrar"
      />

      <h1 className="mt-6 font-display text-[2.4rem] font-extrabold leading-[0.98] tracking-[-0.03em] text-balance animate-entrar [animation-delay:80ms]">
        Hamburguesas que dan <span className="text-acento-texto">vicio.</span>
      </h1>
      <p className="mt-3 max-w-[32ch] text-lg text-suave animate-entrar [animation-delay:140ms]">
        Elige, paga con QR y te lo llevamos a la mesa. Sin hacer fila en caja.
      </p>

      <a
        href="#menu"
        className="presionable mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-acento px-7 py-4 text-lg font-semibold text-white shadow-[0_8px_24px_rgb(var(--sombra-acento)/0.32)] animate-entrar [animation-delay:200ms]"
      >
        Ver el menú
        <HugeiconsIcon icon={ArrowDown01Icon} size={22} strokeWidth={2.2} />
      </a>
    </section>
  );
}
