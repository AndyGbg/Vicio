"use client";

// Todos los íconos de la app salen de una sola librería (Hugeicons),
// así tienen el mismo grosor y estilo en todas partes.
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Hamburger01Icon,
  PopcornIcon,
  ChickenThighsIcon,
  SoftDrink01Icon,
  DrinkIcon,
} from "@hugeicons/core-free-icons";
import type { Categoria } from "@/data/menu";

export { HugeiconsIcon };

export const iconoCategoria: Record<Categoria, typeof Hamburger01Icon> = {
  Hamburguesas: Hamburger01Icon,
  "Pipocas de pollo": PopcornIcon,
  Alitas: ChickenThighsIcon,
  Refrescos: SoftDrink01Icon,
  Bebidas: DrinkIcon,
};

export function IconoCategoria({
  categoria,
  size = 20,
  strokeWidth = 1.7,
  className,
}: {
  categoria: Categoria;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return <HugeiconsIcon icon={iconoCategoria[categoria]} size={size} strokeWidth={strokeWidth} className={className} />;
}
