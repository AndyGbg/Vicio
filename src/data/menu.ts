// Menú de prueba. En el Paso 3 esto vendrá de la base de datos (Supabase).
export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number; // en Bs
  categoria: "Hamburguesas" | "Acompañantes" | "Bebidas";
  emoji: string;
};

export const menu: Producto[] = [
  { id: "h1", nombre: "La Clásica", descripcion: "Carne 150 g, queso cheddar, lechuga, tomate y salsa de la casa", precio: 25, categoria: "Hamburguesas", emoji: "🍔" },
  { id: "h2", nombre: "Doble Vicio", descripcion: "Doble carne, doble cheddar, tocino crocante y cebolla caramelizada", precio: 38, categoria: "Hamburguesas", emoji: "🍔" },
  { id: "h3", nombre: "La Picante", descripcion: "Carne, queso pepper jack, jalapeños y salsa de locoto", precio: 30, categoria: "Hamburguesas", emoji: "🌶️" },
  { id: "h4", nombre: "Pollo Crispy", descripcion: "Pechuga apanada, coleslaw y mayo de ajo", precio: 28, categoria: "Hamburguesas", emoji: "🐔" },
  { id: "a1", nombre: "Papas fritas", descripcion: "Porción grande con sal de la casa", precio: 12, categoria: "Acompañantes", emoji: "🍟" },
  { id: "a2", nombre: "Papas con cheddar y tocino", descripcion: "Bañadas en cheddar fundido", precio: 18, categoria: "Acompañantes", emoji: "🧀" },
  { id: "a3", nombre: "Aros de cebolla", descripcion: "8 unidades con salsa BBQ", precio: 15, categoria: "Acompañantes", emoji: "🧅" },
  { id: "b1", nombre: "Gaseosa 500 ml", descripcion: "Coca-Cola, Fanta o Sprite", precio: 8, categoria: "Bebidas", emoji: "🥤" },
  { id: "b2", nombre: "Limonada", descripcion: "Natural, hecha al momento", precio: 10, categoria: "Bebidas", emoji: "🍋" },
  { id: "b3", nombre: "Mocochinchi", descripcion: "Bien heladito", precio: 7, categoria: "Bebidas", emoji: "🍑" },
];
