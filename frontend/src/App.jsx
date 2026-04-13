import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MenuProvider } from "./contexts/MenuContext";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./components/LoadingSpinner";
import NoticePopup from "./components/NoticePopup";
import BrandBar from "./components/BrandBar";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminTickets from "./pages/admin/AllTickets";
import AdminTicketDetails from "./pages/admin/TicketDetails";
import UsersList from "./pages/admin/UsersList";
import BranchList from "./pages/admin/BranchList";
import BranchTickets from "./pages/admin/BranchTickets";
import AdminUserProfile from "./pages/admin/UserProfile";
import AdminReports from "./pages/admin/Reports";

import UserDashboard from "./pages/user/Dashboard";
import MyTickets from "./pages/user/MyTickets";
import CreateTicket from "./pages/user/CreateTicket";
import UserTicketDetails from "./pages/user/TicketDetails";

import UnderwritingDashboard from "./pages/underwriting/Dashboard";
import UnderwritingTickets from "./pages/underwriting/Tickets";
import UnderwritingTicketDetails from "./pages/underwriting/TicketDetails";

import MisDashboard from "./pages/mis/Dashboard";
import MisTickets from "./pages/mis/Tickets";
import MisTicketDetails from "./pages/mis/TicketDetails";

import ItDashboard from "./pages/it/Dashboard";
import ItTickets from "./pages/it/Tickets";
import ItTicketDetails from "./pages/it/TicketDetails";
import ITUsers from "./pages/it/ITUsers";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

import NoticeList from "./pages/notices/NoticeList";
import NoticeDetail from "./pages/notices/NoticeDetail";
import NoticeForm from "./pages/notices/NoticeForm";
import NoticeSettings from "./pages/notices/NoticeSettings";
import BrandBarSettings from "./pages/BrandBarSettings";
import ActivityLogs from "./pages/admin/ActivityLogs";
import ActivityLogDetail from "./pages/admin/ActivityLogDetail";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseForm from "./pages/KnowledgeBaseForm";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import TwoFactorSettings from "./pages/TwoFactorSettings";
import SessionManagement from "./pages/SessionManagement";
import TicketTemplates from "./pages/admin/TicketTemplates";
import ContactList from "./pages/ContactList";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      admin: "/admin/dashboard",
      user: "/user/dashboard",
      underwriting: "/underwriting/dashboard",
      mis: "/mis/dashboard",
      it: "/it/dashboard",
    };
    return <Navigate to={roleRoutes[user.role] || "/user/dashboard"} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.id) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin/dashboard"
                  : user.role === "underwriting"
                    ? "/underwriting/dashboard"
                    : user.role === "mis"
                      ? "/mis/dashboard"
                      : "/user/dashboard"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <UsersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <AdminUserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branches"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <BranchList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branches/:branchId"
        element={
          <ProtectedRoute allowedRoles={["admin", "mis", "underwriting", "it"]}>
            <BranchTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <MyTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets/create"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <CreateTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <UnderwritingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting/dashboard"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <UnderwritingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting/tickets"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <UnderwritingTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <UnderwritingTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <MisDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis/dashboard"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <MisDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis/tickets"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <MisTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <MisTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/dashboard"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <ItDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/tickets"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <ItTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <ItTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/users"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <ITUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <NoticeList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <NoticeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/create"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <NoticeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <NoticeForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/settings"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <NoticeSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brandbar/settings"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <BrandBarSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ActivityLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ActivityLogDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge-base"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <KnowledgeBase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge-base/create"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <KnowledgeBaseForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/knowledge-base"
        element={
          <ProtectedRoute allowedRoles={["user", "admin", "it", "underwriting", "mis"]}>
            <KnowledgeBase />
          </ProtectedRoute>
        }
      />
      <Route path="/2fa" element={<ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}><TwoFactorSettings /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}><SessionManagement /></ProtectedRoute>} />
      <Route path="/admin/templates" element={<ProtectedRoute allowedRoles={["admin"]}><TicketTemplates /></ProtectedRoute>} />
      <Route path="/admin/contacts" element={<ProtectedRoute allowedRoles={["admin"]}><ContactList /></ProtectedRoute>} />
      <Route path="/user/contacts" element={<ProtectedRoute allowedRoles={["user"]}><ContactList /></ProtectedRoute>} />
      <Route path="/underwriting/contacts" element={<ProtectedRoute allowedRoles={["underwriting"]}><ContactList /></ProtectedRoute>} />
      <Route path="/mis/contacts" element={<ProtectedRoute allowedRoles={["mis"]}><ContactList /></ProtectedRoute>} />
      <Route path="/it/contacts" element={<ProtectedRoute allowedRoles={["it"]}><ContactList /></ProtectedRoute>} />
      <Route
        path="/"
        element={
          <Navigate
            to={
              user?.role === "admin"
                ? "/admin/dashboard"
                : user?.role === "underwriting"
                  ? "/underwriting/dashboard"
                  : user?.role === "mis"
                    ? "/mis/dashboard"
                    : user
                      ? "/user/dashboard"
                      : "/login"
            }
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeProvider>
          <MenuProvider>
            <AppWithPopup />
          </MenuProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppWithPopup() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {user && <BrandBar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-1"
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
      {user && <NoticePopup />}
    </>
  );
}

export default App;