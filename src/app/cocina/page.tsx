"use client";

import PanelPersonal from "@/components/personal/PanelPersonal";
import Cocina from "@/components/personal/Cocina";

// El administrador también puede mirar la pantalla de cocina
const ROLES = ["cocina", "admin"] as const;

// Panel de cocina (tablet o celular en la cocina)
export default function CocinaPage() {
  return (
    <PanelPersonal rolesPermitidos={[...ROLES]} titulo="Cocina">
      {() => <Cocina />}
    </PanelPersonal>
  );
}
