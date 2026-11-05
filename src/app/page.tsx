import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-[100svh] place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-6xl font-extrabold tracking-tight">
          VICIO<span className="text-acento">.</span>
        </h1>
        <p className="mt-3 text-suave">Escanea el QR de tu mesa para pedir.</p>
        <Link
          href="/mesa/1"
          className="presionable mt-8 inline-block rounded-full bg-acento px-6 py-3 font-semibold text-white"
        >
          Probar como mesa 1
        </Link>
      </div>
    </main>
  );
}
