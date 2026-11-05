"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURACION_SALIDA = 200; // la salida es más rápida que la entrada

// Panel que sube desde abajo (estilo iPhone). Anima al abrir y al cerrar.
// "children" recibe una función cerrar(despues?) para cerrar con animación.
export default function Sheet({
  onCerrar,
  onCerrando,
  etiqueta,
  children,
}: {
  onCerrar: () => void;
  onCerrando?: () => void; // avisa al empezar a cerrar (para devolver el fondo a su lugar)
  etiqueta: string;
  children: (cerrar: (despues?: () => void) => void) => React.ReactNode;
}) {
  const [saliendo, setSaliendo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guardamos las funciones en refs para que cerrar() no cambie en cada render
  const alCerrar = useRef(onCerrar);
  const alEmpezarACerrar = useRef(onCerrando);
  useEffect(() => {
    alCerrar.current = onCerrar;
    alEmpezarACerrar.current = onCerrando;
  });

  const cerrar = useCallback((despues?: () => void) => {
    if (timer.current) return;
    setSaliendo(true);
    alEmpezarACerrar.current?.();
    timer.current = setTimeout(() => (despues ?? alCerrar.current)(), DURACION_SALIDA);
  }, []);

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", esc);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [cerrar]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Cerrar"
        onClick={() => cerrar()}
        className={`absolute inset-0 bg-black/40 ${saliendo ? "animate-desaparecer" : "animate-aparecer"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        className={`relative flex max-h-[88svh] w-full max-w-xl flex-col overflow-y-auto rounded-t-[28px] bg-elevada pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgb(0_0_0/0.18)] ${
          saliendo ? "animate-bajar" : "animate-subir"
        }`}
      >
        <div className="sticky top-0 z-10 flex justify-center bg-elevada pb-2 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-borde" />
        </div>
        {children(cerrar)}
      </div>
    </div>
  );
}
