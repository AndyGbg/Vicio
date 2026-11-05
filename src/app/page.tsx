import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-6xl font-extrabold tracking-tight">
          VICIO<span className="text-ketchup">.</span>
        </h1>
        <p className="text-humo mt-3">Escanea el QR de tu mesa para pedir.</p>
        <Link
          href="/mesa/1"
          className="inline-block mt-8 rounded-full bg-mostaza text-carbon font-semibold px-6 py-3"
        >
          Probar como Mesa 1
        </Link>
      </div>
    </main>
  );
}
