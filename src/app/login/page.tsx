"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@/components/Icono";
import { Alert02Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { miPerfil, panelDeRol, supabase, supabaseConfigurado } from "@/lib/supabase";

// /login: acceso SOLO para el personal (caja/administrador y cocina).
// Los clientes no inician sesión: entran directo al menú.
export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Si ya hay una sesión abierta, ir directo a su panel
  useEffect(() => {
    if (!supabaseConfigurado) return;
    miPerfil().then((p) => p && router.replace(panelDeRol[p.rol]));
  }, [router]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    const { error: errAuth } = await supabase().auth.signInWithPassword({ email: correo.trim(), password: clave });
    if (errAuth) {
      setCargando(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }
    const perfil = await miPerfil();
    if (!perfil) {
      await supabase().auth.signOut();
      setCargando(false);
      setError("Tu cuenta no tiene un rol asignado. Pide al administrador que te lo asigne.");
      return;
    }
    router.replace(panelDeRol[perfil.rol]);
  };

  return (
    <main className="grid min-h-[100svh] place-items-center px-5 py-10">
      <div className="w-full max-w-sm animate-entrar">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          VICIO<span className="text-acento">.</span>
        </h1>
        <p className="mt-2 text-suave">Acceso del personal: caja y cocina.</p>

        {!supabaseConfigurado && (
          <div className="mt-6 flex gap-3 rounded-2xl bg-acento-suave p-4 text-sm text-acento-texto">
            <HugeiconsIcon icon={Alert02Icon} size={20} strokeWidth={2} className="shrink-0" />
            <p>
              Falta conectar la base de datos. Crea el archivo <b>.env.local</b> con los datos de Supabase (los pasos
              están en <b>supabase/LEEME.md</b>).
            </p>
          </div>
        )}

        <form onSubmit={entrar} className="mt-8 space-y-5">
          <div>
            <label htmlFor="correo" className="block text-sm font-semibold">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="caja@vicio.bo"
              className="mt-2 h-12 w-full rounded-xl bg-superficie px-4 ring-1 ring-borde placeholder:text-suave focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>
          <div>
            <label htmlFor="clave" className="block text-sm font-semibold">
              Contraseña
            </label>
            <div className="relative mt-2">
              <input
                id="clave"
                type={verClave ? "text" : "password"}
                autoComplete="current-password"
                required
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="h-12 w-full rounded-xl bg-superficie pl-4 pr-12 ring-1 ring-borde focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-acento"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-suave"
              >
                <HugeiconsIcon icon={verClave ? ViewOffIcon : ViewIcon} size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-acento-texto">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando || !supabaseConfigurado}
            className="presionable h-12 w-full rounded-full bg-acento font-semibold text-white shadow-[0_8px_24px_rgb(var(--sombra-acento)/0.3)] disabled:opacity-50"
          >
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-suave">¿Eres cliente? No necesitas cuenta, pide directo desde el menú.</p>

        <p className="mt-3 text-center text-sm">
          <Link href="/" className="font-semibold text-suave underline underline-offset-4 decoration-borde">
            Volver al menú
          </Link>
        </p>
      </div>
    </main>
  );
}
