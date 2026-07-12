import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { PortalLayout } from '@/components/layout/portal-layout';
import { JockeyLayout } from '@/pages/Jockey/jockey-layout';
import { RefereeLayout } from '@/pages/Referee/referee-layout';
import { SpectatorLayout } from '@/pages/Spectator/spectator-layout';
import { DevToggle } from '@/components/dev-toggle';

// Jockey Pages
import JockeyHome from '@/pages/Jockey/home';
import JockeyProfile from '@/pages/Jockey/profile';
import JockeyTournaments from '@/pages/Jockey/tournaments';
import JockeyTournamentDetail from '@/pages/Jockey/tournament-detail';
import JockeyRaces from '@/pages/Jockey/races';
import JockeyRaceDetail from '@/pages/Jockey/race-detail';
import JockeyJockeys from '@/pages/Jockey/jockeys';
import JockeyJockeyProfile from '@/pages/Jockey/jockey-profile';

// Referee Pages
import RefereeDashboard from '@/pages/Referee/dashboard';
import RefereeTournaments from '@/pages/Referee/tournaments';
import RefereeTournamentDetail from '@/pages/Referee/tournament-detail';
import RefereeRaces from '@/pages/Referee/races';
import RefereeRaceDetail from '@/pages/Referee/race-detail';
import RefereeJockeys from '@/pages/Referee/jockeys';
import RefereeJockeyProfile from '@/pages/Referee/jockey-profile';

// Spectator Pages
import SpectatorHome from '@/pages/Spectator/home';
import SpectatorProfile from '@/pages/Spectator/profile';
import SpectatorTournaments from '@/pages/Spectator/tournaments';
import SpectatorTournamentDetail from '@/pages/Spectator/tournament-detail';
import SpectatorRaces from '@/pages/Spectator/races';
import SpectatorRaceDetail from '@/pages/Spectator/race-detail';
import SpectatorJockeys from '@/pages/Spectator/jockeys';
import SpectatorJockeyProfile from '@/pages/Spectator/jockey-profile';

// Auth & Portal Pages
import PortalLogin from '@/pages/portal/Login';
import PortalRegister from '@/pages/portal/register';
import ForgotPassword from '@/pages/portal/ForgotPassword';
import Forbidden from '@/pages/portal/Forbidden';

// Other Portals
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { Dashboard as AdminDashboard } from '@/pages/admin/Dashboard';
import { Tournaments as AdminTournaments } from '@/pages/admin/Tournaments';
import { Races as AdminRaces } from '@/pages/admin/Races';
import { Medical as AdminMedical } from '@/pages/admin/Medical';
import { Verifications as AdminVerifications } from '@/pages/admin/Verifications';
import { SystemData as AdminSystemData } from '@/pages/admin/SystemData';
import { DoctorLayout } from '@/pages/doctor/DoctorLayout';
import { HealthChecking as DoctorHealthChecking } from '@/pages/doctor/HealthChecking';
import { OwnerLayout } from '@/pages/horse_owner/OwnerLayout';
import OwnerHome from '@/pages/horse_owner/OwnerHome';
import OwnerJockeys from '@/pages/horse_owner/OwnerJockeys';
import OwnerTournaments from '@/pages/horse_owner/OwnerTournaments';
import OwnerTournamentDetail from '@/pages/horse_owner/OwnerTournamentDetail';
import OwnerRaceDetail from '@/pages/horse_owner/OwnerRaceDetail';
import OwnerProfile from '@/pages/horse_owner/OwnerProfile';
import OwnerJockeyProfile from '@/pages/horse_owner/OwnerJockeyProfile';
import { OwnerManagementLayout } from '@/pages/horse_owner/OwnerManagementLayout';
import OwnerHorses from '@/pages/horse_owner/OwnerHorses';
import OwnerRegistrations from '@/pages/horse_owner/OwnerRegistrations';

function ProtectedAdminRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  return (
    <Route path={path}>
      {(params) => (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminLayout>
            <Component {...params} />
          </AdminLayout>
        </ProtectedRoute>
      )}
    </Route>
  );
}

function ProtectedDoctorRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  return (
    <Route path={path}>
      {(params) => (
        <ProtectedRoute allowedRoles={['DOCTOR']}>
          <DoctorLayout>
            <Component {...params} />
          </DoctorLayout>
        </ProtectedRoute>
      )}
    </Route>
  );
}

function ProtectedOwnerHomeRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  return (
    <Route path={path}>
      {(params) => (
        <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
          <OwnerLayout>
            <Component {...params} />
          </OwnerLayout>
        </ProtectedRoute>
      )}
    </Route>
  );
}

function ProtectedOwnerManagementRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  return (
    <Route path={path}>
      {(params) => (
        <ProtectedRoute allowedRoles={['HORSE_OWNER']}>
          <OwnerManagementLayout>
            <Component {...params} />
          </OwnerManagementLayout>
        </ProtectedRoute>
      )}
    </Route>
  );
}

// Guest / Vãng Lai Pages
import GuestHome from '@/pages/portal/guest/home';
import GuestTournaments from '@/pages/portal/guest/tournaments';
import GuestTournamentDetail from '@/pages/portal/guest/tournament-detail';
import GuestRaces from '@/pages/portal/guest/races';
import GuestRaceDetail from '@/pages/portal/guest/race-detail';
import GuestJockeys from '@/pages/portal/guest/jockeys';
import GuestJockeyProfile from '@/pages/portal/guest/jockey-profile';

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  if (!token) {
    return <Redirect to="/portal/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role || '')) {
    return <Redirect to="/portal/forbidden" />;
  }

  return <>{children}</>;
}

function ProtectedPortalRoute({ path, allowedRoles, component: Component }: { path: string; allowedRoles: string[]; component: React.ComponentType<any> }) {
  const isJockey = path.startsWith('/jockey/');
  const isReferee = path.startsWith('/referee/');
  const isSpectator = path.startsWith('/spectator/');

  let Layout = PortalLayout;
  if (isJockey) Layout = JockeyLayout;
  else if (isReferee) Layout = RefereeLayout;
  else if (isSpectator) Layout = SpectatorLayout;

  return (
    <Route path={path}>
      {(params) => (
        <ProtectedRoute allowedRoles={allowedRoles}>
          <Layout>
            <Component {...params} />
          </Layout>
        </ProtectedRoute>
      )}
    </Route>
  );
}

function PortalRoute({ path, component: Component }: { path: string; component: React.ComponentType<any> }) {
  return (
    <Route path={path}>
      {(params) => (
        <PortalLayout>
          <Component {...params} />
        </PortalLayout>
      )}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin Portal */}
      <ProtectedAdminRoute path="/admin" component={AdminDashboard} />
      <ProtectedAdminRoute path="/admin/tournaments" component={AdminTournaments} />
      <ProtectedAdminRoute path="/admin/races" component={AdminRaces} />
      <ProtectedAdminRoute path="/admin/medical" component={AdminMedical} />
      <ProtectedAdminRoute path="/admin/verifications" component={AdminVerifications} />
      <ProtectedAdminRoute path="/admin/system-data" component={AdminSystemData} />

      {/* Doctor Portal */}
      <ProtectedDoctorRoute path="/doctor" component={DoctorHealthChecking} />
      <ProtectedDoctorRoute path="/doctor/health-check" component={DoctorHealthChecking} />

      {/* Horse Owner Portal */}
      <ProtectedOwnerHomeRoute path="/owner-home" component={OwnerHome} />
      <ProtectedOwnerHomeRoute path="/owner-home/jockeys" component={OwnerJockeys} />
      <ProtectedOwnerHomeRoute path="/owner-home/jockeys/:id" component={OwnerJockeyProfile} />
      <ProtectedOwnerHomeRoute path="/owner-home/tournaments" component={OwnerTournaments} />
      <ProtectedOwnerHomeRoute path="/owner-home/tournaments/:id" component={OwnerTournamentDetail} />
      <ProtectedOwnerHomeRoute path="/owner-home/races/:id" component={OwnerRaceDetail} />
      <ProtectedOwnerHomeRoute path="/owner-home/profile" component={OwnerProfile} />
      <ProtectedOwnerManagementRoute path="/owner-management/horses" component={OwnerHorses} />
      <ProtectedOwnerManagementRoute path="/owner-management/registrations" component={OwnerRegistrations} />

      {/* Jockey Portal */}
      <ProtectedPortalRoute path="/jockey/home" allowedRoles={['JOCKEY']} component={JockeyHome} />
      <ProtectedPortalRoute path="/jockey/profile" allowedRoles={['JOCKEY']} component={JockeyProfile} />
      <ProtectedPortalRoute path="/jockey/tournaments" allowedRoles={['JOCKEY']} component={JockeyTournaments} />
      <ProtectedPortalRoute path="/jockey/tournaments/:id" allowedRoles={['JOCKEY']} component={JockeyTournamentDetail} />
      <ProtectedPortalRoute path="/jockey/races" allowedRoles={['JOCKEY']} component={JockeyRaces} />
      <ProtectedPortalRoute path="/jockey/races/:id" allowedRoles={['JOCKEY']} component={JockeyRaceDetail} />
      <ProtectedPortalRoute path="/jockey/jockeys" allowedRoles={['JOCKEY']} component={JockeyJockeys} />
      <ProtectedPortalRoute path="/jockey/jockeys/:id" allowedRoles={['JOCKEY']} component={JockeyJockeyProfile} />

      {/* Referee Portal */}
      <ProtectedPortalRoute path="/referee/home" allowedRoles={['REFEREE']} component={RefereeDashboard} />
      <ProtectedPortalRoute path="/referee/dashboard" allowedRoles={['REFEREE']} component={RefereeDashboard} />
      <ProtectedPortalRoute path="/referee/tournaments" allowedRoles={['REFEREE']} component={RefereeTournaments} />
      <ProtectedPortalRoute path="/referee/tournaments/:id" allowedRoles={['REFEREE']} component={RefereeTournamentDetail} />
      <ProtectedPortalRoute path="/referee/races" allowedRoles={['REFEREE']} component={RefereeRaces} />
      <ProtectedPortalRoute path="/referee/races/:id" allowedRoles={['REFEREE']} component={RefereeRaceDetail} />
      <ProtectedPortalRoute path="/referee/jockeys" allowedRoles={['REFEREE']} component={RefereeJockeys} />
      <ProtectedPortalRoute path="/referee/jockeys/:id" allowedRoles={['REFEREE']} component={RefereeJockeyProfile} />

      {/* Spectator Portal */}
      <ProtectedPortalRoute path="/spectator/home" allowedRoles={['SPECTATOR']} component={SpectatorHome} />
      <ProtectedPortalRoute path="/spectator/profile" allowedRoles={['SPECTATOR']} component={SpectatorProfile} />
      <ProtectedPortalRoute path="/spectator/tournaments" allowedRoles={['SPECTATOR']} component={SpectatorTournaments} />
      <ProtectedPortalRoute path="/spectator/tournaments/:id" allowedRoles={['SPECTATOR']} component={SpectatorTournamentDetail} />
      <ProtectedPortalRoute path="/spectator/races" allowedRoles={['SPECTATOR']} component={SpectatorRaces} />
      <ProtectedPortalRoute path="/spectator/races/:id" allowedRoles={['SPECTATOR']} component={SpectatorRaceDetail} />
      <ProtectedPortalRoute path="/spectator/jockeys" allowedRoles={['SPECTATOR']} component={SpectatorJockeys} />
      <ProtectedPortalRoute path="/spectator/jockeys/:id" allowedRoles={['SPECTATOR']} component={SpectatorJockeyProfile} />

      {/* Auth Pages */}
      <PortalRoute path="/portal/login" component={PortalLogin} />
      <PortalRoute path="/portal/register" component={PortalRegister} />
      <PortalRoute path="/portal/forgot-password" component={ForgotPassword} />
      <PortalRoute path="/portal/forbidden" component={Forbidden} />

      {/* Guest / Vãng Lai (No Login) */}
      <PortalRoute path="/portal" component={GuestHome} />
      <PortalRoute path="/portal/tournaments" component={GuestTournaments} />
      <PortalRoute path="/portal/tournaments/:id" component={GuestTournamentDetail} />
      <PortalRoute path="/portal/races" component={GuestRaces} />
      <PortalRoute path="/portal/races/:id" component={GuestRaceDetail} />
      <PortalRoute path="/portal/jockeys" component={GuestJockeys} />
      <PortalRoute path="/portal/jockeys/:id" component={GuestJockeyProfile} />

      {/* Root Path Redirect */}
      <Route path="/">
        <Redirect to="/portal" />
      </Route>

      {/* Catch-all for non-matching root paths */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
        <SonnerToaster />
        <DevToggle />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
