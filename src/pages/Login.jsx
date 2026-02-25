// src/pages/Login.jsx
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <section className="auth-shell">
            <div className="card auth-card">
                <LoginForm />
            </div>
        </section>
    );
}