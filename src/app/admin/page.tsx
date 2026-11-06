"use client";

import PanelPersonal from "@/components/personal/PanelPersonal";

const ROLES = ["admin"] as const;

// Panel de caja / administrador (en la computadora de caja)
export default function AdminPage() {
  return (
    <PanelPersonal rolesPermitidos={[...ROLES]} titulo="Caja">
      {(perfil) => (
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight">Hola, {perfil.nombre}</h1>
          <p className="mt-2 text-suave">
            Iniciaste sesión como administrador. En el siguiente paso aquí verás los pedidos en vivo para confirmar pagos
            y marcar entregas, y podrás editar el menú, los precios y las mesas.
          </p>
        </div>
      )}
    </PanelPersonal>
  );
}
