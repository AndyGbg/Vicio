"use client";

import Image from "next/image";
import { useState } from "react";
import type { Categoria } from "@/data/menu";
import { IconoCategoria } from "../Icono";

// Muestra la foto del producto. Si la foto todavía no existe en /public,
// deja un espacio gris con el ícono de su categoría (así la app nunca se ve rota).
export default function Foto({
  src,
  alt,
  sizes,
  categoria = "Hamburguesas",
  icono = 32,
  priority = false,
  className = "",
}: {
  src?: string;
  alt: string;
  sizes: string;
  categoria?: Categoria;
  icono?: number;
  priority?: boolean;
  className?: string;
}) {
  const [fallo, setFallo] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-superficie ${className}`}>
      {src && !fallo ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFallo(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[#c4c4c0]" aria-label={`Foto de ${alt} (pendiente)`}>
          <IconoCategoria categoria={categoria} size={icono} strokeWidth={1.4} />
        </div>
      )}
    </div>
  );
}
