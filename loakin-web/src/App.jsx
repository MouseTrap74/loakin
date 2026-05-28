import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
<<<<<<< HEAD
import FavoritesPage from './pages/member/FavoritesPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Member Pages
import EditProfilePage from './pages/member/EditProfilePage';
import ChangePasswordPage from './pages/member/ChangePasswordPage';
import PublicProfilePage from './pages/member/PublicProfilePage';

// Admin Pages
import AdminUserListPage from './pages/admin/AdminUserListPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBannedKeywordPage from './pages/admin/AdminBannedKeywordPage';

// Tambahkan import ini bersama import halaman lainnya
import ListingBrowsePage from './pages/listing/ListingBrowsePage';
import ListingDetailPage from './pages/listing/ListingDetailPage';
import CreateListingPage from './pages/listing/CreateListingPage';
import EditListingPage from './pages/listing/EditListingPage';
import MyListingsPage from './pages/listing/MyListingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminListingPage from './pages/admin/AdminListingPage';

// Review & Report Pages
import SellerReviewsPage from './pages/member/SellerReviewsPage';
import MyBlockedUsersPage from './pages/member/MyBlockedUsersPage';
import MySellerReviewsPage from './pages/member/MySellerReviewsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminReportDetailPage from './pages/admin/AdminReportDetailPage';

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
        <Route path="/users/:id" element={<PublicProfilePage />} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
        <Route path="/admin/banned-keywords" element={<AdminRoute><AdminBannedKeywordPage /></AdminRoute>} />

        {/* Guest Routes */}
        <Route path="/" element={<ListingBrowsePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        {/* Member Routes */}
        <Route path="/listings/create" element={
          <ProtectedRoute><CreateListingPage /></ProtectedRoute>
        } />
        <Route path="/listings/:id/edit" element={
          <ProtectedRoute><EditListingPage /></ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute><MyListingsPage /></ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboardPage /></AdminRoute>
        } />
        <Route path="/admin/listings" element={
          <AdminRoute><AdminListingPage /></AdminRoute>
        } />

        {/* Member Routes - Review & Blokir */}
        <Route path="/users/:id/reviews" element={<SellerReviewsPage />} />
        <Route path="/my-reviews" element={
          <ProtectedRoute><MySellerReviewsPage /></ProtectedRoute>
        } />
        <Route path="/blocked-users" element={
          <ProtectedRoute><MyBlockedUsersPage /></ProtectedRoute>
        } />

        {/* Admin Routes - Laporan */}
        <Route path="/admin/reports" element={
          <AdminRoute><AdminReportsPage /></AdminRoute>
        } />
        <Route path="/admin/reports/:id" element={
          <AdminRoute><AdminReportDetailPage /></AdminRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
=======
import { usePushNotifications } from './hooks/usePushNotifications';

// Auth
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage   from './pages/auth/ResetPasswordPage';

// Member
import EditProfilePage     from './pages/member/EditProfilePage';
import ChangePasswordPage  from './pages/member/ChangePasswordPage';
import PublicProfilePage   from './pages/member/PublicProfilePage';
import InboxPage           from './pages/member/InboxPage';
import ConversationPage    from './pages/member/ConversationPage';
import NotificationsPage   from './pages/member/NotificationsPage';

import ChatWidget from './components/ChatWidget';

// Listing
import ListingBrowsePage   from './pages/listing/ListingBrowsePage';
import ListingDetailPage   from './pages/listing/ListingDetailPage';
import CreateListingPage   from './pages/listing/CreateListingPage';
import EditListingPage     from './pages/listing/EditListingPage';
import MyListingsPage      from './pages/listing/MyListingsPage';

// Admin
import AdminDashboardPage      from './pages/admin/AdminDashboardPage';
import AdminListingPage        from './pages/admin/AdminListingPage';
import AdminUserListPage       from './pages/admin/AdminUserListPage';
import AdminUserDetailPage     from './pages/admin/AdminUserDetailPage';
import AdminSettingsPage       from './pages/admin/AdminSettingsPage';
import AdminBannedKeywordPage  from './pages/admin/AdminBannedKeywordPage';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn() ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn()) return <Navigate to="/login" />;
    if (!isAdmin())    return <Navigate to="/" />;
    return children;
};

function App() {
    const { isLoggedIn } = useAuth();

    // Register Web Push service worker for logged-in users
    // Silently skipped if browser doesn't support it
    usePushNotifications(isLoggedIn());

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth */}
                <Route path="/login"            element={<LoginPage />} />
                <Route path="/register"         element={<RegisterPage />} />
                <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
                <Route path="/reset-password"   element={<ResetPasswordPage />} />

                {/* Public */}
                <Route path="/"              element={<ListingBrowsePage />} />
                <Route path="/listings/:id"  element={<ListingDetailPage />} />
                <Route path="/users/:id"     element={<PublicProfilePage />} />

                {/* Member */}
                <Route path="/profile"                  element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                <Route path="/profile/change-password"  element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                <Route path="/my-listings"              element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                <Route path="/listings/create"          element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
                <Route path="/listings/:id/edit"        element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />

                {/* Chat & Notifications */}
                <Route path="/messages"         element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
                <Route path="/messages/:id"     element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
                <Route path="/notifications"    element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin/dashboard"      element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/users"           element={<AdminRoute><AdminUserListPage /></AdminRoute>} />
                <Route path="/admin/users/:id"       element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
                <Route path="/admin/listings"        element={<AdminRoute><AdminListingPage /></AdminRoute>} />
                <Route path="/admin/settings"        element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
                <Route path="/admin/banned-keywords" element={<AdminRoute><AdminBannedKeywordPage /></AdminRoute>} />
            </Routes>
            <ChatWidget />
        </BrowserRouter>
    );
>>>>>>> 0619bd2 (created chat and notification features for loakin)
}

export default App;