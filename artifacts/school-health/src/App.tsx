import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { UserRole } from "@workspace/api-client-react";

import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import DashboardPage from "@/pages/dashboard";
import NursePage from "@/pages/nurse";
import VisitsPage from "@/pages/visits";
import AlertsPage from "@/pages/alerts";
import StudentsPage from "@/pages/students";
import NotificationsPage from "@/pages/notifications";
import HealthRecordsPage from "@/pages/health-records";
import ResourcesPage from "@/pages/resources";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { token, userRole } = useAuth();

  if (!token || !userRole) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Redirect to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={IndexPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />

      <Route path="/dashboard">
        <ProtectedRoute allowedRoles={["admin", "nurse", "parent", "student"]}>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/nurse">
        <ProtectedRoute allowedRoles={["nurse", "admin"]}>
          <NursePage />
        </ProtectedRoute>
      </Route>
      <Route path="/visits">
        <ProtectedRoute allowedRoles={["nurse", "admin"]}>
          <VisitsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/alerts">
        <ProtectedRoute allowedRoles={["nurse", "admin"]}>
          <AlertsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/students">
        <ProtectedRoute allowedRoles={["nurse", "admin"]}>
          <StudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute allowedRoles={["nurse", "admin", "parent", "student"]}>
          <NotificationsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/health-records">
        <ProtectedRoute allowedRoles={["parent", "student"]}>
          <HealthRecordsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/resources">
        <ProtectedRoute allowedRoles={["parent", "student"]}>
          <ResourcesPage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
