import type { MetadataRoute } from "next";

// Esto hace que la web se pueda "instalar" en el celular como una app (PWA)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vicio",
    short_name: "Vicio",
    description: "Pide tus hamburguesas desde la mesa",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0d0b",
    theme_color: "#0f0d0b",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
