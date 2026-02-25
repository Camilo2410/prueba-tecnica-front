// src/pages/ResetPasswordComplete.jsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";

/**
 * Lee parámetros de querystring (?uid=...&token=...)
 */
function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Pantalla que abre el link del correo:
 * /reset-password?uid=...&token=...
 *
 * - Permite escribir nueva contraseña
 * - Llama al backend: POST /api/auth/password-reset/confirm/
 * - Si sale bien, limpia tokens (logout) para forzar login con la nueva clave
 * - Muestra botón "Volver al login"
 */
export default function ResetPasswordCompletePage() {
    const q = useQuery();
    const navigate = useNavigate();

    const uid = q.get("uid") || "";
    const token = q.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const canSubmit = Boolean(uid && token && newPassword.length >= 6);

    const logoutLocal = () => {
        // ✅ Muy importante: si tenías JWT guardado, podrías “seguir entrando”
        // sin probar la nueva contraseña. Esto fuerza a re-autenticar.
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_user");
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const { data } = await api.post("/auth/password-reset/confirm/", {
                uid,
                token,
                new_password: newPassword,
            });

            // ✅ Logout automático para obligar login con la nueva contraseña
            logoutLocal();

            setSuccess(data?.message || "Contraseña actualizada correctamente.");
        } catch (err) {
            setError(err?.response?.data?.detail || "No se pudo actualizar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        logoutLocal(); // por si acaso
        navigate("/login");
    };

    return (
        <section className="auth-shell">
            <div className="card auth-card">
                <h1 className="auth-title" style={{ margin: 0 }}>
                    Cambiar contraseña
                </h1>
                <p className="auth-subtitle" style={{ margin: "6px 0 14px" }}>
                    Escribe tu nueva contraseña para finalizar.
                </p>

                {!uid || !token ? (
                    <div className="error">
                        El enlace no es válido o está incompleto. Vuelve a solicitar la recuperación.
                    </div>
                ) : (
                    <form className="form" onSubmit={onSubmit}>
                        <label>
                            Nueva contraseña
                            <input
                                className="input"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </label>

                        <div className="row-between">
                            <button className="btn primary" type="submit" disabled={!canSubmit || loading}>
                                {loading ? "Guardando..." : "Cambiar contraseña"}
                            </button>

                            <button type="button" className="link" onClick={goToLogin} disabled={loading}>
                                Volver al login
                            </button>
                        </div>
                    </form>
                )}

                {error && <div className="error">{error}</div>}

                {success && (
                    <div className="success" style={{ marginTop: 12 }}>
                        {success}
                        <div style={{ marginTop: 10 }}>
                            <button className="btn small primary" onClick={goToLogin}>
                                Volver al login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}