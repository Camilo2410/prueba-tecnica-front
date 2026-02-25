// src/components/UsersPanel.jsx
import { useEffect, useState } from "react";
import api from "../api/client";

const initialCreateForm = {
    full_name: "",
    email: "",
    password: "",
};

export default function UsersPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [createForm, setCreateForm] = useState(initialCreateForm);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");

    const [editingUserId, setEditingUserId] = useState(null);
    // ✅ Edit NO permite cambiar password, solo name/email/is_active
    const [editForm, setEditForm] = useState({
        full_name: "",
        email: "",
        is_active: true,
    });

    const loadUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/users/");
            setUsers(data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Error cargando usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCreateForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateError("");
        setCreateSuccess("");

        try {
            await api.post("/users/", createForm);
            setCreateSuccess("Usuario creado ✅");
            setCreateForm(initialCreateForm);
            loadUsers();
        } catch (err) {
            const data = err?.response?.data;
            setCreateError(typeof data === "object" ? JSON.stringify(data) : "Error creando usuario");
        }
    };

    const startEdit = (user) => {
        setEditingUserId(user.id);
        setEditForm({
            full_name: user.full_name,
            email: user.email,
            is_active: user.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditForm({ full_name: "", email: "", is_active: true });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const saveEdit = async (userId) => {
        try {
            // ✅ No mandamos password nunca
            const payload = {
                full_name: editForm.full_name,
                email: editForm.email,
                is_active: editForm.is_active,
            };

            await api.patch(`/users/${userId}/`, payload);
            cancelEdit();
            loadUsers();
        } catch (err) {
            alert("Error actualizando usuario");
        }
    };

    const deactivateUser = async (userId) => {
        const ok = confirm("¿Desactivar este usuario?");
        if (!ok) return;

        try {
            await api.delete(`/users/${userId}/`);
            loadUsers();
        } catch (err) {
            alert("Error desactivando usuario");
        }
    };

    return (
        <div className="users-grid">
            {/* Crear usuario */}
            <div className="card">
                <div className="card-head">
                    <h3>Crear usuario</h3>
                </div>

                <form className="form grid-2" onSubmit={handleCreate}>
                    <label className="full-row">
                        Nombre completo
                        <input
                            className="input"
                            name="full_name"
                            value={createForm.full_name}
                            onChange={handleCreateChange}
                            required
                        />
                    </label>

                    <label>
                        Email
                        <input
                            className="input"
                            name="email"
                            type="email"
                            value={createForm.email}
                            onChange={handleCreateChange}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            className="input"
                            name="password"
                            type="password"
                            value={createForm.password}
                            onChange={handleCreateChange}
                            required
                        />
                    </label>

                    <div className="full-row row-between">
                        <button className="btn primary" type="submit">
                            Crear usuario
                        </button>
                    </div>
                </form>

                {createSuccess && <div className="success">{createSuccess}</div>}
                {createError && <div className="error">{createError}</div>}
            </div>

            {/* Listado */}
            <div className="card">
                <div className="card-head row-between">
                    <div>
                        <h3>Listado</h3>
                        <span className="hint">{users.length} usuarios</span>
                    </div>
                    <button className="btn small" onClick={loadUsers}>
                        {loading ? "..." : "Recargar"}
                    </button>
                </div>

                {error && <div className="error">{error}</div>}

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                        <tr>
                            <th style={{ width: 60 }}>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th style={{ width: 90 }}>Activo</th>
                            <th style={{ width: 190 }}>Creado</th>
                            <th style={{ width: 250 }}>Acciones</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.map((u) => {
                            const isEditing = editingUserId === u.id;

                            return (
                                <tr key={u.id}>
                                    <td>{u.id}</td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                className="input slim table-input"
                                                name="full_name"
                                                value={editForm.full_name}
                                                onChange={handleEditChange}
                                            />
                                        ) : (
                                            u.full_name
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                className="input slim table-input"
                                                name="email"
                                                value={editForm.email}
                                                onChange={handleEditChange}
                                            />
                                        ) : (
                                            <span className="mono">{u.email}</span>
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                name="is_active"
                                                type="checkbox"
                                                checked={editForm.is_active}
                                                onChange={handleEditChange}
                                            />
                                        ) : (
                                            <span className={`pill ${u.is_active ? "ok" : "off"}`}>
                          {u.is_active ? "Sí" : "No"}
                        </span>
                                        )}
                                    </td>

                                    <td>{new Date(u.created_at).toLocaleString()}</td>

                                    <td className="td-actions">
                                        {isEditing ? (
                                            <div className="actions-row">
                                                <button
                                                    className="btn small primary"
                                                    type="button"
                                                    onClick={() => saveEdit(u.id)}
                                                >
                                                    Guardar
                                                </button>
                                                <button className="btn small" type="button" onClick={cancelEdit}>
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="actions-row">
                                                <button className="btn small" type="button" onClick={() => startEdit(u)}>
                                                    Editar
                                                </button>
                                                <button
                                                    className="btn small danger"
                                                    type="button"
                                                    onClick={() => deactivateUser(u.id)}
                                                    disabled={!u.is_active}
                                                    title={!u.is_active ? "Este usuario ya está desactivado" : "Desactivar usuario"}
                                                >
                                                    Desactivar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        {users.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="muted">
                                    No hay usuarios
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}