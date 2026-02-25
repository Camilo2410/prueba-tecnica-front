import ResetPasswordPanel from "../components/ResetPasswordPanel";

export default function ResetPasswordPage() {
    return (
        <section className="page">
            <div className="page-header">
                <h1>Recuperación de contraseña</h1>
                <p>Solicita el reset y confirma con UID + token.</p>
            </div>

            <div className="grid-one">
                <div className="card">
                    <ResetPasswordPanel />
                </div>
            </div>
        </section>
    );
}