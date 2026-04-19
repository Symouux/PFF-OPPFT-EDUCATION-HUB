import AuthPage from "./pages/AuthPage";
import { Routes, Route, Navigate } from "react-router-dom";
const AdminPage = () => <h1>Page Admin</h1>;
const MentorPage = () => <h1>Page Mentor</h1>;
const EtudiantPage = () => <h1>Page Étudiant</h1>;

export default function App() {
  return (
    <Routes>
      {/* Route principale */}
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/admin" element={<AdminPage />} />
      <Route path="/mentor" element={<MentorPage />} />
      <Route path="/etudiant" element={<EtudiantPage />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
