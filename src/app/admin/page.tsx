"use client";

import PanelPersonal from "@/components/personal/PanelPersonal";
import Caja from "@/components/personal/Caja";

const ROLES = ["admin"] as const;

// Panel de caja / administrador (en la computadora de caja)
export default function AdminPage() {
  return (
    <PanelPersonal rolesPermitidos={[...ROLES]} titulo="Caja">
      {() => <Caja />}
    </PanelPersonal>
  );
}
