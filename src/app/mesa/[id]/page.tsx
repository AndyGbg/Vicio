import MenuMesa from "@/components/MenuMesa";

// Cada QR apunta a /mesa/1, /mesa/2, ... así sabemos de qué mesa viene el pedido
export default async function MesaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MenuMesa mesa={id} />;
}
