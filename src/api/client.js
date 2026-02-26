// src/api/client.js
import axios from "axios";

/**
 * Cliente Axios para consumir el backend Django (DRF + JWT).
 * - baseURL = "/api" (respeta tu configuración actual)
 * - Adjunta automáticamente el access token a cada request
 * - Si el access token expira y el backend responde 401, intenta refrescarlo
 *   usando el refresh token y reintenta la solicitud original.
 */

const api = axios.create({
    baseURL: "/api",
});

/* =========================
   Helpers de tokens (localStorage)
   ========================= */
const getAccess = () => localStorage.getItem("access_token");
const getRefresh = () => localStorage.getItem("refresh_token");

const setAccess = (token) => localStorage.setItem("access_token", token);

const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
};

/* =========================
   Endpoints públicos (NO refrescar / NO redirigir)
   ========================= */
const PUBLIC_ENDPOINTS = [
    "/auth/login/",
    "/auth/password-reset/request/",
    "/auth/password-reset/confirm/",
    "/auth/token/refresh/",
];

/* =========================
   1) Interceptor de REQUEST
   Adjunta el Bearer token si existe.
   ========================= */
api.interceptors.request.use((config) => {
    const token = getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/* =========================
   2) Interceptor de RESPONSE
   Refresca el token si llega un 401 (token expirado / inválido)
   ========================= */

/**
 * Evita disparar múltiples refresh en paralelo.
 * - isRefreshing: indica si ya hay un refresh en curso
 * - queue: cola de requests que llegan mientras se refresca el token
 */
let isRefreshing = false;
let queue = [];

/**
 * Resuelve o rechaza todas las promesas encoladas una vez termina el refresh.
 */
const processQueue = (error, newToken = null) => {
    queue.forEach((p) => (error ? p.reject(error) : p.resolve(newToken)));
    queue = [];
};

api.interceptors.response.use(
    // Si todo sale bien, retornamos la respuesta normal
    (res) => res,

    // Manejo de errores
    async (err) => {
        const original = err.config;

        // Si no hay respuesta (error de red, CORS, etc.), no intentamos refresh
        if (!err.response) return Promise.reject(err);

        const url = original?.url || "";

        // ✅ Si es endpoint público, NO intentamos refrescar ni redirigir.
        // Dejamos que el componente maneje el error (ej. credenciales inválidas).
        if (PUBLIC_ENDPOINTS.some((p) => url.includes(p))) {
            return Promise.reject(err);
        }

        // Solo interceptamos 401 (no autorizado) para endpoints protegidos
        if (err.response.status !== 401) return Promise.reject(err);

        // Evita loop infinito: si ya reintentamos una vez y volvió a fallar, salimos
        if (original._retry) return Promise.reject(err);

        // Si no hay refresh token guardado, toca re-login
        const refresh = getRefresh();
        if (!refresh) {
            clearAuth();
            window.location.href = "/login";
            return Promise.reject(err);
        }

        /**
         * Si ya hay un refresh corriendo, encolamos esta request
         * y la reintentamos cuando el refresh termine.
         */
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push({
                    resolve: (token) => {
                        // Reintentamos la request original con el token nuevo
                        original.headers.Authorization = `Bearer ${token}`;
                        resolve(api(original));
                    },
                    reject,
                });
            });
        }

        // Marcamos que vamos a reintentar (para evitar loops)
        original._retry = true;
        isRefreshing = true;

        try {
            /**
             * IMPORTANTE:
             * Usamos axios "crudo" (no api) para evitar disparar interceptores de api
             * y crear un bucle.
             *
             * Endpoint backend: POST /api/auth/token/refresh/
             * Body: { "refresh": "<refresh_token>" }
             */
            const { data } = await axios.post("/api/auth/token/refresh/", { refresh });

            const newAccess = data?.access;
            if (!newAccess) throw new Error("El refresh no devolvió un access token");

            // Guardamos el access nuevo
            setAccess(newAccess);

            // Desbloqueamos y resolvemos los requests en cola
            processQueue(null, newAccess);

            // Reintentamos la solicitud original con el token nuevo
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
        } catch (refreshErr) {
            // Si falla el refresh (refresh expirado/ inválido), limpiamos y mandamos a login
            processQueue(refreshErr, null);
            clearAuth();
            window.location.href = "/login";
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;