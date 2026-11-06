// MENÚ PROVISIONAL del Vicio (hasta tener el menú oficial del local).
// Lo confirmado: 4 hamburguesas (dos de Bs 30 y dos de Bs 45), pipocas de pollo,
// alitas, refrescos (Coca-Cola, Sprite, Fanta y las minis en vidrio), limonada y mocochinchi.
// Los NOMBRES de las hamburguesas y los precios marcados "prueba" son inventados: cámbialos.
//
// FOTOS: pon cada foto en public/productos/ con el nombre que dice "imagen".
// Si una foto no está, la app muestra un espacio gris en su lugar.
// Más adelante todo esto vendrá de la base de datos (Supabase).

// Cuántas mesas tiene el local (se usará para generar e imprimir un QR por mesa)
export const totalMesas = 10;

export const categorias = ["Hamburguesas", "Pipocas de pollo", "Alitas", "Refrescos", "Bebidas"] as const;
export type Categoria = (typeof categorias)[number];

export type Extra = { id: string; nombre: string; precio: number };

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number; // en Bs
  categoria: Categoria;
  imagen: string; // ruta de la foto dentro de /public
  destacado?: boolean; // aparece en "Lo más pedido"
  etiqueta?: string; // ej: "Nuevo", "Favorito"
  personalizable?: boolean; // muestra "¿Le quitamos algo?" y extras
};

// Extras y "quitar ingredientes": de ejemplo, cambiarán con el menú real
export const extras: Extra[] = [
  { id: "x-queso", nombre: "Extra queso", precio: 4 },
  { id: "x-tocino", nombre: "Extra tocino", precio: 6 },
  { id: "x-huevo", nombre: "Huevo frito", precio: 4 },
];

export const quitables = ["Sin cebolla", "Sin tomate", "Sin lechuga", "Sin salsas"];

export const menu: Producto[] = [
  // HAMBURGUESAS: precios confirmados, nombres y descripciones provisionales
  { id: "hamburguesa-1", nombre: "Hamburguesa Clásica", descripcion: "Carne, queso, lechuga, tomate y salsa de la casa", precio: 30, categoria: "Hamburguesas", imagen: "/productos/hamburguesa-1.jpg", personalizable: true },
  { id: "hamburguesa-2", nombre: "Hamburguesa con Tocino", descripcion: "Carne, queso, tocino crocante y cebolla", precio: 30, categoria: "Hamburguesas", imagen: "/productos/hamburguesa-2.jpg", personalizable: true },
  { id: "hamburguesa-3", nombre: "Hamburguesa Doble", descripcion: "Doble carne, doble queso y salsa de la casa", precio: 45, categoria: "Hamburguesas", imagen: "/productos/hamburguesa-3.jpg", destacado: true, personalizable: true },
  { id: "hamburguesa-4", nombre: "Hamburguesa Vicio", descripcion: "La especial de la casa", precio: 45, categoria: "Hamburguesas", imagen: "/productos/hamburguesa-4.jpg", destacado: true, etiqueta: "Favorita", personalizable: true },

  // PIPOCAS DE POLLO: papas fritas con pollo (precios de prueba)
  { id: "pipocas", nombre: "Pipocas de pollo", descripcion: "Papas fritas con pipocas de pollo crocante", precio: 25, categoria: "Pipocas de pollo", imagen: "/productos/pipocas.jpg", destacado: true },

  // ALITAS (precios de prueba)
  { id: "alitas-6", nombre: "Alitas x6", descripcion: "Seis alitas con papas fritas", precio: 30, categoria: "Alitas", imagen: "/productos/alitas-6.jpg", destacado: true },
  { id: "alitas-12", nombre: "Alitas x12", descripcion: "Doce alitas con papas fritas, para compartir", precio: 55, categoria: "Alitas", imagen: "/productos/alitas-12.jpg" },

  // REFRESCOS (precios de prueba)
  { id: "coca-cola", nombre: "Coca-Cola", descripcion: "Bien fría", precio: 8, categoria: "Refrescos", imagen: "/productos/coca-cola.jpg" },
  { id: "sprite", nombre: "Sprite", descripcion: "Bien fría", precio: 8, categoria: "Refrescos", imagen: "/productos/sprite.jpg" },
  { id: "fanta", nombre: "Fanta", descripcion: "Bien fría", precio: 8, categoria: "Refrescos", imagen: "/productos/fanta.jpg" },
  { id: "mini", nombre: "Mini en vidrio", descripcion: "La clásica botellita de vidrio. Coca-Cola, Sprite o Fanta", precio: 5, categoria: "Refrescos", imagen: "/productos/mini.jpg", etiqueta: "Las famosas" },

  // BEBIDAS NATURALES (precios de prueba)
  { id: "limonada", nombre: "Limonada", descripcion: "Natural, hecha al momento", precio: 10, categoria: "Bebidas", imagen: "/productos/limonada.jpg" },
  { id: "mocochinchi", nombre: "Mocochinchi", descripcion: "Bien heladito", precio: 7, categoria: "Bebidas", imagen: "/productos/mocochinchi.jpg" },
];

// Un producto dentro del carrito, con lo que el cliente eligió
export type ItemCarrito = {
  clave: string;
  producto: Producto;
  cantidad: number;
  extras: Extra[];
  quitar: string[];
  nota: string;
};

export const precioUnitario = (i: Pick<ItemCarrito, "producto" | "extras">) =>
  i.producto.precio + i.extras.reduce((s, e) => s + e.precio, 0);
