"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "../Icono";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { miPerfil, panelDeRol, supabase, supabaseConfigurado, type Rol } from "@/lib/supabase";

type Perfil = { id: string; nombre: string; rol: Rol };

// Envoltorio de los paneles del personal: revisa la sesión y el rol.
// (La seguridad real la ponen las reglas RLS de la base de datos.)
export default function PanelPersonal({
  rolesPermitidos,
  titulo,
  children,
}: {
  rolesPermitidos: Rol[];
  titulo: string;
  children: (perfil: Perfil) => React.ReactNode;
}) {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const permitidos = rolesPermitidos.join(","); // texto, para no repetir la consulta en cada render

  useEffect(() => {
    if (!supabaseConfigurado) {
      router.replace("/login");
      return;
    }
    miPerfil().then((p) => {
      if (!p) router.replace("/login");
      else if (!permitidos.split(",").includes(p.rol)) router.replace(panelDeRol[p.rol]);
      else setPerfil(p);
    });
  }, [router, permitidos]);

  const salir = async () => {
    await supabase().auth.signOut();
    router.replace("/login");
  };

  if (!perfil) {
    return (
      <main className="grid min-h-[100svh] place-items-center text-suave" aria-busy="true">
        Cargando...
      </main>
    );
  }

  return (
    <div className="min-h-[100svh] bg-superficie print:bg-white">
      <header className="sticky top-0 z-30 border-b border-borde bg-fondo/90 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl font-extrabold tracking-tight">
              VICIO<span className="text-acento">.</span>
            </span>
            <span className="font-semibold text-suave">{titulo}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-suave sm:inline">{perfil.nombre}</span>
            <button
              onClick={salir}
              className="presionable flex items-center gap-2 rounded-full bg-superficie px-4 py-2 text-sm font-semibold"
            >
              <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.9} />
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6">{children(perfil)}</main>
    </div>
  );
}
