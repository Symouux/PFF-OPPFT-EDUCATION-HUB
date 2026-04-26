import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
const AdminPage = () => <h1>Page Admin</h1>;
const MentorPage = () => <h1>Page Mentor</h1>;
const EtudiantPage = () => <h1>Page Étudiant</h1>;

export default function App() {
  return (
    <Routes>
      {/* Route principale */}
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["etudiant"]} />}>
          <Route path="/etudiant" element={<EtudiantPage />} />
      </Route>  
      
      <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
          <Route path="/mentor" element={<MentorPage />} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
