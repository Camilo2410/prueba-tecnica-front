import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

import LoginPage from "./pages/Login";
import ResetPasswordPage from "./pages/ResetPassword";
import UsersPage from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPasswordCompletePage from "./pages/ResetPasswordComplete";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rutas públicas sin Layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordCompletePage />} />            {/* Rutas privadas con Layout */}
            <Route
                path="/users"
                element={
                    <Layout>
                        <ProtectedRoute>
                            <UsersPage />
                        </ProtectedRoute>
                    </Layout>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}