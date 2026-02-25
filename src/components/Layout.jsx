// src/components/Layout.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const isAuthScreen =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/reset");

    const hasToken = !!localStorage.getItem("access_token");

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_user");
        navigate("/login");
    };

    if (isAuthScreen) {
        return <div className="auth-shell">{children}</div>;
    }

    return (
        <div className="app-shell">
            <div className="topbar">
                <div className="container topbar-inner">
                    <div className="topbar-title">
                        <div className="brand-title">Prueba Técnica</div>
                        <div className="brand-subtitle">CRUD Usuarios · JWT · Reset</div>
                    </div>

                    <div className="topbar-actions">
                        {hasToken && (
                            <button className="btn danger small" onClick={logout}>
                                Cerrar sesión
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="app-main">
                <div className="container">{children}</div>
            </main>
        </div>
    );
}