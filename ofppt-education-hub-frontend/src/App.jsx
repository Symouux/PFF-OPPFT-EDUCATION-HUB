import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Pages placeholder pour les routes protégées (à compléter par Othman)
const AdminPage = () => <h1>Page Admin</h1>;
const MentorPage = () => <h1>Page Mentor</h1>;
const EtudiantPage = () => <h1>Page Étudiant</h1>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/mentor" element={<MentorPage />} />
      <Route path="/etudiant" element={<EtudiantPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
