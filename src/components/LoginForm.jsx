// src/components/LoginForm.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function LoginForm({ onLoginSuccess }) {
    const navigate = useNavigate();

    const [mode, setMode] = useState("login"); // "login" | "reset"

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    });

    const [resetEmail, setResetEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const title = useMemo(() => (mode === "login" ? "Iniciar sesión" : "Recuperar contraseña"), [mode]);

    const subtitle = useMemo(
        () =>
            mode === "login"
                ? "Ingresa tus credenciales para acceder."
                : "Te enviaremos un enlace si el correo existe.",
        [mode]
    );

    const handleLoginChange = (e) => {
        setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const switchTo = (nextMode) => {
        setMode(nextMode);
        setError("");
        setNotice("");
    };

    const onSubmitLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setNotice("");

        try {
            const { data } = await api.post("/auth/login/", loginForm);

            const access = data?.access || data?.tokens?.access;
            const refresh = data?.refresh || data?.tokens?.refresh;

            if (access) localStorage.setItem("access_token", access);
            if (refresh) localStorage.setItem("refresh_token", refresh);

            if (onLoginSuccess) onLoginSuccess(data);

            navigate("/users");
        } catch (err) {
            const apiMsg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : null);

            setError(apiMsg || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setNotice("");

        try {
            await api.post("/auth/password-reset/request/", { email: resetEmail });

            setNotice(
                "Si el correo existe, enviamos un enlace. Revisa la terminal del backend para ver el link."
            );
        } catch (err) {
            setNotice(
                "Si el correo existe, enviamos un enlace. Revisa la terminal del backend para ver el link."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <h1 className="auth-title" style={{ margin: 0 }}>
                    {title}
                </h1>
                <p className="auth-subtitle" style={{ margin: "6px 0 0" }}>
                    {subtitle}
                </p>
            </div>

            {mode === "login" ? (
                <form onSubmit={onSubmitLogin} className="form">
                    <label>
                        Email
                        <input
                            className="input"
                            name="email"
                            type="email"
                            value={loginForm.email}
                            onChange={handleLoginChange}
                            placeholder="Email"
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label>
                        Password
                        <input
                            className="input"
                            name="password"
                            type="password"
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                        />
                    </label>

                    <div className="row-between">
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? "Ingresando..." : "Log In"}
                        </button>

                        <button
                            type="button"
                            className="link"
                            onClick={() => switchTo("reset")}
                            disabled={loading}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={onSubmitReset} className="form">
                    <label>
                        Email
                        <input
                            className="input"
                            name="email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Email"
                            required
                            autoComplete="email"
                        />
                    </label>

                    <div className="row-between">
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? "Enviando..." : "Enviar link"}
                        </button>

                        <button
                            type="button"
                            className="link"
                            onClick={() => switchTo("login")}
                            disabled={loading}
                        >
                            Volver a login
                        </button>
                    </div>
                </form>
            )}

            {error && <div className="error">{error}</div>}
            {notice && <div className="notice">{notice}</div>}
        </div>
    );
}