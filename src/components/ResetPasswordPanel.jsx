import { useState } from "react";
import api from "../api/client";

export default function ResetPasswordPanel() {
    const [requestEmail, setRequestEmail] = useState("user1@test.com");
    const [requestMsg, setRequestMsg] = useState("");
    const [requestError, setRequestError] = useState("");

    const [confirmForm, setConfirmForm] = useState({
        uid: "",
        token: "",
        new_password: "Nueva12345",
    });
    const [confirmMsg, setConfirmMsg] = useState("");
    const [confirmError, setConfirmError] = useState("");

    const handleRequest = async (e) => {
        e.preventDefault();
        setRequestMsg("");
        setRequestError("");

        try {
            const { data } = await api.post("/auth/password-reset/request/", {
                email: requestEmail,
            });
            setRequestMsg(data.message || "Solicitud enviada");
        } catch (err) {
            setRequestError("Error enviando solicitud");
        }
    };

    const handleConfirmChange = (e) => {
        setConfirmForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        setConfirmMsg("");
        setConfirmError("");

        try {
            const { data } = await api.post("/auth/password-reset/confirm/", confirmForm);
            setConfirmMsg(data.message || "Contraseña actualizada");
        } catch (err) {
            setConfirmError(err?.response?.data?.detail || "Error al confirmar reset");
        }
    };

    return (
        <div className="reset-grid">
            <div>
                <h3>1) Solicitar reset</h3>
                <form onSubmit={handleRequest} className="form">
                    <label>
                        Email
                        <input
                            type="email"
                            value={requestEmail}
                            onChange={(e) => setRequestEmail(e.target.value)}
                            required
                        />
                    </label>
                    <button className="btn" type="submit">Enviar link</button>
                </form>
                {requestMsg && <p className="success">{requestMsg}</p>}
                {requestError && <p className="error">{requestError}</p>}
                <p className="muted small">
                    Revisa la terminal del backend (console.EmailBackend) para copiar <b>uid</b> y <b>token</b>.
                </p>
            </div>

            <div>
                <h3>2) Confirmar reset</h3>
                <form onSubmit={handleConfirm} className="form">
                    <label>
                        UID
                        <input
                            name="uid"
                            value={confirmForm.uid}
                            onChange={handleConfirmChange}
                            required
                        />
                    </label>

                    <label>
                        Token
                        <input
                            name="token"
                            value={confirmForm.token}
                            onChange={handleConfirmChange}
                            required
                        />
                    </label>

                    <label>
                        Nueva contraseña
                        <input
                            name="new_password"
                            type="password"
                            value={confirmForm.new_password}
                            onChange={handleConfirmChange}
                            required
                        />
                    </label>

                    <button className="btn" type="submit">Cambiar contraseña</button>
                </form>

                {confirmMsg && <p className="success">{confirmMsg}</p>}
                {confirmError && <p className="error">{confirmError}</p>}
            </div>
        </div>
    );
}