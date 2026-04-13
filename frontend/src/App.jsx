import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MenuProvider } from "./contexts/MenuContext";
import LoadingSpinner from "./components/LoadingSpinner";
import NoticePopup from "./components/NoticePopup";
import BrandBar from "./components/BrandBar";
import PageWrapper from "./components/PageWrapper";

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
            <PageWrapper><AdminDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><AdminDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><AdminTickets /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><AdminTicketDetails /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><AdminReports /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><UsersList /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><AdminUserProfile /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branches"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><BranchList /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branches/:branchId"
        element={
          <ProtectedRoute allowedRoles={["admin", "mis", "underwriting", "it"]}>
            <PageWrapper><BranchTickets /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <PageWrapper><UserDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <PageWrapper><UserDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <PageWrapper><MyTickets /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets/create"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <PageWrapper><CreateTicket /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <PageWrapper><UserTicketDetails /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <PageWrapper><UnderwritingDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting/dashboard"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <PageWrapper><UnderwritingDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting/tickets"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <PageWrapper><UnderwritingTickets /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/underwriting/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["underwriting"]}>
            <PageWrapper><UnderwritingTicketDetails /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <PageWrapper><MisDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis/dashboard"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <PageWrapper><MisDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis/tickets"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <PageWrapper><MisTickets /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["mis"]}>
            <PageWrapper><MisTicketDetails /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/dashboard"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <PageWrapper><ItDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/tickets"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <PageWrapper><ItTickets /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <PageWrapper><ItTicketDetails /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/it/users"
        element={
          <ProtectedRoute allowedRoles={["it"]}>
            <PageWrapper><ITUsers /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <PageWrapper><Profile /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <PageWrapper><Messages /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <PageWrapper><NoticeList /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}>
            <PageWrapper><NoticeDetail /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/create"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><NoticeForm /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><NoticeForm /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices/settings"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><NoticeSettings /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/brandbar/settings"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><BrandBarSettings /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><ActivityLogs /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity-logs/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><ActivityLogDetail /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageWrapper><AnalyticsDashboard /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge-base"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><KnowledgeBase /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge-base/create"
        element={
          <ProtectedRoute allowedRoles={["admin", "it"]}>
            <PageWrapper><KnowledgeBaseForm /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/knowledge-base"
        element={
          <ProtectedRoute allowedRoles={["user", "admin", "it", "underwriting", "mis"]}>
            <PageWrapper><KnowledgeBase /></PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route path="/2fa" element={<ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}><PageWrapper><TwoFactorSettings /></PageWrapper></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute allowedRoles={["admin", "user", "it", "underwriting", "mis"]}><PageWrapper><SessionManagement /></PageWrapper></ProtectedRoute>} />
      <Route path="/admin/templates" element={<ProtectedRoute allowedRoles={["admin"]}><PageWrapper><TicketTemplates /></PageWrapper></ProtectedRoute>} />
      <Route path="/admin/contacts" element={<ProtectedRoute allowedRoles={["admin"]}><PageWrapper><ContactList /></PageWrapper></ProtectedRoute>} />
      <Route path="/user/contacts" element={<ProtectedRoute allowedRoles={["user"]}><PageWrapper><ContactList /></PageWrapper></ProtectedRoute>} />
      <Route path="/underwriting/contacts" element={<ProtectedRoute allowedRoles={["underwriting"]}><PageWrapper><ContactList /></PageWrapper></ProtectedRoute>} />
      <Route path="/mis/contacts" element={<ProtectedRoute allowedRoles={["mis"]}><PageWrapper><ContactList /></PageWrapper></ProtectedRoute>} />
      <Route path="/it/contacts" element={<ProtectedRoute allowedRoles={["it"]}><PageWrapper><ContactList /></PageWrapper></ProtectedRoute>} />
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

  return (
    <>
      {user && <BrandBar />}
      <div className={user ? "flex-1" : ""}>
        <AppRoutes />
      </div>
      {user && <NoticePopup />}
    </>
  );
}

export default App;