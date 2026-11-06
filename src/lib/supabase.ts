import { createBrowserClient } from "@supabase/ssr";

// Las claves salen del archivo .env.local (nunca se suben a GitHub)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase la llama "publishable key" (antes "anon key"); aceptamos cualquiera de los dos nombres
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && anonKey);

let cliente: ReturnType<typeof createBrowserClient> | null = null;

// Cliente de Supabase para usar en el navegador (uno solo para toda la app)
export function supabase() {
  if (!url || !anonKey) {
    throw new Error("Falta configurar Supabase en .env.local");
  }
  if (!cliente) cliente = createBrowserClient(url, anonKey);
  return cliente;
}

export type Rol = "admin" | "cocina";

// A qué panel va cada rol después de iniciar sesión
export const panelDeRol: Record<Rol, string> = {
  admin: "/admin",
  cocina: "/cocina",
};

// Devuelve el rol y nombre del usuario conectado (o null si no hay sesión o no tiene rol)
export async function miPerfil(): Promise<{ id: string; nombre: string; rol: Rol } | null> {
  const sb = supabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("perfiles").select("id, nombre, rol").eq("id", user.id).maybeSingle();
  return (data as { id: string; nombre: string; rol: Rol } | null) ?? null;
}
