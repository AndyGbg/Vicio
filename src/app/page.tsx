import MenuMesa from "@/components/MenuMesa";

// Inicio: el menú para los clientes (sin iniciar sesión).
// Sin QR solo se puede ver el menú; para pedir hay que escanear el QR de la mesa (/mesa/N).
// El personal entra por el ícono de arriba (/login).
export default function Inicio() {
  return <MenuMesa mesa={null} />;
}
