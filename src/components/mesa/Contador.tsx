import { HugeiconsIcon } from "../Icono";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";

export default function Contador({
  valor,
  onCambiar,
  min = 1,
}: {
  valor: number;
  onCambiar: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Quitar uno"
        onClick={() => onCambiar(Math.max(min, valor - 1))}
        className="presionable grid size-9 place-items-center rounded-full bg-fondo ring-1 ring-borde"
      >
        <HugeiconsIcon icon={MinusSignIcon} size={16} strokeWidth={2.4} />
      </button>
      <span key={valor} className="w-6 text-center font-semibold tabular-nums animate-pulso">
        {valor}
      </span>
      <button
        aria-label="Agregar uno"
        onClick={() => onCambiar(valor + 1)}
        className="presionable grid size-9 place-items-center rounded-full bg-acento text-white"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}
