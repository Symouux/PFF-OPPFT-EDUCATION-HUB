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
import MentorChat from "./pages/Mentor/MentorChat";
import MentorProjects from "./pages/Mentor/MentorProjects";
import MentorReview from "./pages/Mentor/MentorReview";
import MentorReviews from "./pages/Mentor/reviews";
import MentorProfile from "./pages/Mentor/MentorProfile";
import StudentLayout from "./pages/Student/StudentLayout";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentProjects from "./pages/Student/StudentProjects";
import StudentMentors from "./pages/Student/StudentMentors";
import StudentResources from "./pages/Student/StudentResources";
import StudentChat from "./pages/Student/StudentChat";
import StudentProfile from "./pages/Student/StudentProfile";

export default function App() {
  return (
    <Routes>
      {/* Route principale */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/" element={<Navigate to="/auth" />} /> */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Admin route*/}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="projects" element={<ProjectList />} />
        </Route>
      </Route>
      {/* Etudiant route*/}
      <Route element={<ProtectedRoute allowedRoles={["etudiant"]} />}>
        <Route path="/etudiant" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="projects" element={<StudentProjects />} />
          <Route path="mentors" element={<StudentMentors />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Route>
      {/* Mentor route*/}
      <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
        <Route path="/mentor" element={<MentorLayout />}>
          <Route index element={<MentorDashboard />} />
          <Route path="notifications" element={<MentorNotifications />} />
          <Route path="chat" element={<MentorChat />} />
          <Route path="projects" element={<MentorProjects />} />
          <Route path="review/:projectId" element={<MentorReview />} />
          <Route path="reviews" element={<MentorReviews />} />
          <Route path="profile" element={<MentorProfile />} />
        </Route>
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
