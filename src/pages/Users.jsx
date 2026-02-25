// src/pages/Users.jsx
import UsersPanel from "../components/UsersPanel";

export default function UsersPage() {
    return (
        <section className="page">
            <div className="page-header compact">
                <h1>Usuarios</h1>
                <p>Crear, editar y desactivar usuarios (JWT requerido).</p>
            </div>

            <UsersPanel />
        </section>
    );
}