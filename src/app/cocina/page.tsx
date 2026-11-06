"use client";

import PanelPersonal from "@/components/personal/PanelPersonal";

// El administrador también puede mirar la pantalla de cocina
const ROLES = ["cocina", "admin"] as const;

// Panel de cocina (tablet o celular en la cocina)
export default function CocinaPage() {
  return (
    <PanelPersonal rolesPermitidos={[...ROLES]} titulo="Cocina">
      {(perfil) => (
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight">Hola, {perfil.nombre}</h1>
          <p className="mt-2 text-suave">
            Iniciaste sesión en cocina. En el siguiente paso aquí aparecerán al instante los pedidos ya pagados, para
            marcarlos como preparando y listos.
          </p>
        </div>
      )}
    </PanelPersonal>
  );
}
