import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/layout";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={IndexPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />

      <Route path="/dashboard">
        <Layout><DashboardPage /></Layout>
      </Route>
      <Route path="/nurse">
        <Layout><NursePage /></Layout>
      </Route>
      <Route path="/visits">
        <Layout><VisitsPage /></Layout>
      </Route>
      <Route path="/alerts">
        <Layout><AlertsPage /></Layout>
      </Route>
      <Route path="/students">
        <Layout><StudentsPage /></Layout>
      </Route>
      <Route path="/notifications">
        <Layout><NotificationsPage /></Layout>
      </Route>
      <Route path="/health-records">
        <Layout><HealthRecordsPage /></Layout>
      </Route>
      <Route path="/resources">
        <Layout><ResourcesPage /></Layout>
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
