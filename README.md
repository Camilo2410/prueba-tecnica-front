# Prueba Técnica Front — React + Vite (Django DRF + JWT)

Este repositorio contiene un **front sencillo** (React + Vite) para consumir la API del backend (Django REST Framework + JWT) y demostrar:

- Login (JWT)
- CRUD de usuarios (list / create / edit / deactivate) **protegido**
- Recuperación de contraseña:
    - Solicitud de link por correo
    - Pantalla de “cambiar contraseña” usando `uid` + `token` (query params)
- Refresh automático del `access_token` cuando expira (usa `refresh_token`)

---

## Requisitos

- Node.js 18+ (recomendado)
- Backend corriendo (ver README del backend) y accesible desde el front.

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite levantará el proyecto y te mostrará la URL local (por ejemplo: `http://localhost:5173`).

> **Importante**: este front consume la API usando `baseURL: "/api"` (ver `src/api/client.js`).  
> Para que funcione en dev, normalmente debes usar un proxy de Vite o tener el backend sirviendo bajo el mismo host.
>
> - Si ya lo tienes funcionando, no necesitas cambiar nada.
> - Si necesitas proxy: en `vite.config.js` agrega:
>
> ```js
> export default {
>   server: {
>     proxy: {
>       "/api": "http://127.0.0.1:8000",
>     },
>   },
> };
> ```

---

## Estructura del proyecto (resumen)

- `src/api/client.js`
    - Axios instance con `Authorization: Bearer <access_token>`
    - Interceptor de respuesta que, ante `401`, intenta refrescar con `/api/auth/token/refresh/`
- `src/components/ProtectedRoute.jsx`
    - Protege rutas que requieren estar autenticado
- `src/components/LoginForm.jsx`
    - Formulario de login y modo “recuperar contraseña”
- `src/components/UsersPanel.jsx`
    - Panel CRUD de usuarios
- `src/pages/Login.jsx`
    - Pantalla de login
- `src/pages/ResetPassword.jsx`
    - Pantalla para pedir el correo de recuperación
- `src/pages/ResetPasswordComplete.jsx`
    - Pantalla a la que llega el link del correo, con `uid` y `token` en la URL
- `src/pages/Users.jsx`
    - Pantalla con el CRUD

---

## Flujo de pantallas

### 1) Login

Ruta: **`/login`**

- El usuario escribe `email` y `password`.
- Al enviar, se llama:
    - `POST /api/auth/login/`
- Si el backend responde tokens, se guardan:
    - `localStorage.access_token`
    - `localStorage.refresh_token`
- Luego se redirige a:
    - **`/users`**

**Errores típicos:**
- Credenciales inválidas → se muestra mensaje (cuando el backend devuelve `detail`).

---

### 2) Usuarios (CRUD protegido)

Ruta: **`/users`** (protegida con `ProtectedRoute`)

- Al cargar, el front llama:
    - `GET /api/users/` (requiere `Authorization: Bearer <access_token>`)
- Se muestran los usuarios en tabla con acciones.

#### Crear usuario
- Form: `full_name`, `email`, `password`
- Request:
    - `POST /api/users/`
- Nota de negocio: **el usuario se crea activo por defecto** (no se envía `is_active` en creación).

#### Editar usuario
- Se puede editar:
    - `full_name`, `email`, `is_active`
- Request:
    - `PATCH /api/users/{id}/`
- Nota: en el front actual, **no se cambia contraseña desde editar** (se usa recuperación para eso).

#### Desactivar usuario (borrado lógico)
- Botón **Desactivar**:
    - `DELETE /api/users/{id}/`
- En UI: si ya está desactivado, el botón queda deshabilitado.

---

### 3) Recuperar contraseña (solicitud)

Ruta: **`/reset`** (pública)

- El usuario escribe un correo.
- Request:
    - `POST /api/auth/password-reset/request/`
- Por seguridad, el mensaje es genérico (no revela si existe el correo).
- En desarrollo, el backend imprime el email en consola (console.EmailBackend) con un link así:
    - `http://localhost:5173/reset-password?uid=...&token=...`

---

### 4) Cambiar contraseña desde el link

Ruta: **`/reset-password?uid=...&token=...`**

- La pantalla lee `uid` y `token` desde query params.
- El usuario escribe `new_password`.
- Request:
    - `POST /api/auth/password-reset/confirm/`
    - Body:
        - `uid`, `token`, `new_password`
- Si responde OK, se muestra mensaje y un botón:
    - **Volver al login**

---

## Manejo automático del refresh token

Archivo: `src/api/client.js`

- Cada request agrega:
    - `Authorization: Bearer <access_token>`
- Si el backend responde **401**, el interceptor:
    1. Intenta refrescar con:
        - `POST /api/auth/token/refresh/` (envía `refresh`)
    2. Si obtiene un nuevo `access`, lo guarda y reintenta la request original.
    3. Si falla, limpia localStorage y redirige a `/login`.

> Esto evita que el usuario tenga que “recargar” o reiniciar el front cuando expira el token.

---

## Cómo probar rápido (checklist)

1. Levanta backend y asegúrate de tener usuarios de prueba (seed).
2. Levanta front con `npm run dev`.
3. Ve a:
    - `/login` → inicia sesión
    - `/users` → crea, edita, desactiva
    - `/reset` → pide recuperación y abre el link de consola
    - `/reset-password?...` → cambia contraseña

---

## Notas de seguridad / permisos (por alcance de la prueba)

La prueba solicitaba autenticación JWT, pero **no definía roles/administradores**.  
Por eso, el sistema deja que **cualquier usuario autenticado** pueda crear/editar/desactivar otros usuarios (según requerimiento mínimo de la prueba). Si se necesitara, se podría agregar fácilmente:

- Permisos por rol (admin vs usuario)
- Restricción: “solo puedes editarte a ti mismo”
- Auditoría (quién desactivó a quién)

---

## Scripts útiles

- Ejecutar en dev:
    - `npm run dev`
- Build:
    - `npm run build`
- Preview build:
    - `npm run preview`
