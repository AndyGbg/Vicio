import MenuMesa from "@/components/MenuMesa";

// Cada QR apunta a /mesa/7?c=k8f2x : número de mesa + código secreto de esa mesa.
// Los QR para imprimir se generan en el panel de caja (pestaña Mesas).
export default async function MesaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { id } = await params;
  const { c } = await searchParams;
  return <MenuMesa mesa={id} codigo={c ?? null} />;
}
