import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Member Pages
import EditProfilePage from './pages/member/EditProfilePage';
import ChangePasswordPage from './pages/member/ChangePasswordPage';
import LocationSettingPage from './pages/member/LocationSettingPage';
import CategoryPreferencePage from './pages/member/CategoryPreferencePage';
import PublicProfilePage from './pages/member/PublicProfilePage';

// Admin Pages
import AdminUserListPage from './pages/admin/AdminUserListPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBannedKeywordPage from './pages/admin/AdminBannedKeywordPage';

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn()) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Member Routes */}
        <Route path="/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/profile/location" element={<ProtectedRoute><LocationSettingPage /></ProtectedRoute>} />
        <Route path="/profile/preferences" element={<ProtectedRoute><CategoryPreferencePage /></ProtectedRoute>} />
        <Route path="/users/:id" element={<PublicProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
        <Route path="/admin/banned-keywords" element={<AdminRoute><AdminBannedKeywordPage /></AdminRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;