# Conectar el Vicio con Supabase

## 1. Crear las tablas
1. Entra a tu proyecto en supabase.com.
2. Menú izquierdo: **SQL Editor** > **New query**.
3. Abre `supabase/esquema.sql`, copia TODO, pégalo y dale **Run**.
4. Debe decir "Success. No rows returned".

## 2. Conectar la app (archivo .env.local)
1. En Supabase: **Project Settings** > **API**. Copia el **Project URL** y la **anon public key**.
2. En VS Code, en la carpeta principal del proyecto (al lado de `package.json`),
   crea un archivo nuevo llamado exactamente `.env.local` con este contenido:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pega-aqui-la-publishable-key
```

3. Reinicia el servidor: `Ctrl + C` y `npm run dev`.

> `.env.local` NUNCA se sube a GitHub (ya está en `.gitignore`).
> NO pongas ahí la "service_role key" ni la contraseña de la base de datos.

## 3. Crear las cuentas del personal
1. En Supabase: **Authentication** > **Users** > **Add user** > **Create new user**.
2. Crea una cuenta para caja (ej: `caja@vicio.bo`) y otra para cocina (ej: `cocina@vicio.bo`).
   Marca **Auto Confirm User**.
3. En **SQL Editor** ejecuta (cambia los correos si usaste otros):

```sql
insert into perfiles (id, nombre, rol)
  select id, 'Caja', 'admin' from auth.users where email = 'caja@vicio.bo';
insert into perfiles (id, nombre, rol)
  select id, 'Cocina', 'cocina' from auth.users where email = 'cocina@vicio.bo';
```

4. Abre `localhost:3000` e inicia sesión. Caja va a `/admin`, cocina va a `/cocina`.

## Quién puede hacer qué (reglas RLS)
| | Cliente (sin cuenta) | Cocina | Admin / Caja |
|---|---|---|---|
| Ver menú | Sí | Sí | Sí |
| Crear pedido | Solo con el QR válido de su mesa | No | Sí |
| Ver pedidos | Solo el suyo | Solo los ya pagados | Todos |
| Cambiar estado | No | Preparando / Listo | Todo |
| Ver códigos de mesas | No | No | Sí |
| Editar menú y precios | No | No | Sí |

## 4. Pago con Yasta y pedidos en vivo (cambio 02)
1. **SQL Editor** > **New query** > pega TODO `supabase/02-pago-yasta.sql` > **Run**.
2. Guarda la imagen del QR de Yasta del Vicio como `public/qr-pago.png`.
3. Inicia sesión como caja > pestaña **Mesas** > **Abrir como cliente** en cualquier mesa
   (el link lleva el código secreto, por ejemplo `/mesa/7?c=k8f2x`).
4. Pide algo y toca **Confirmar y pagar**. En otra pestaña, en `/admin`, toca **Pago recibido**.
5. Inicia sesión como cocina (otra ventana o en modo incógnito) en `/cocina`: el pedido aparece al instante.

### Flujo
| Paso | Quién | Estado |
|---|---|---|
| Confirma su pedido y ve el QR (10 min) | Cliente | Esperando pago |
| Ve el pago en Yasta y toca "Pago recibido" | Caja | En cocina |
| "Empezar" | Cocina | Preparando |
| "Listo" | Cocina | Listo |
| "Entregado en la mesa" | Caja | Entregado |
| Nadie confirmó en 10 min | Automático | Cancelado (caja puede reactivar) |
