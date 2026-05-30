import AuthPage from "./pages/Auth/AuthPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import UserList from "./pages/Admin/UsersList";
import ProjectList from "./pages/Admin/Projects";
import ResourceList from "./pages/Admin/Resources";
import MentorLayout from "./pages/Mentor/MentorLayout";
import MentorDashboard from "./pages/Mentor/MentorDashboard";
const AdminPage = () => <h1>Page Admin</h1>;

const EtudiantPage = () => <h1>Page Étudiant</h1>;

export default function App() {
  return (
    <Routes>
      {/* Route principale */}
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin route*/}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="users" element={<UserList />} />

          <Route path="projects" element={<ProjectList />} />

          {/* <Route path="resources" element={<ResourceList />} /> */}
        </Route>
      </Route>

      {/* Etudiant route*/}
      <Route element={<ProtectedRoute allowedRoles={["etudiant"]} />}>
        <Route path="/etudiant" element={<EtudiantPage />} />
      </Route>

      {/* Mentor route*/}
      <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
        <Route path="/mentor" element={<MentorLayout />}>
          <Route index element={<MentorDashboard />} />
        </Route>
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
