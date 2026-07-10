import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { SidebarLayout } from '@/components/layout/sidebar';
import { PortalLayout } from '@/components/layout/portal-layout';

import Dashboard from '@/pages/dashboard';
import JockeyList from '@/pages/jockey-list';
import JockeyProfile from '@/pages/jockey-profile';
import HorseList from '@/pages/horse-list';
import TournamentList from '@/pages/tournament-list';
import TournamentDetail from '@/pages/tournament-detail';
import RaceList from '@/pages/race-list';
import RaceDetail from '@/pages/race-detail';
import IncidentList from '@/pages/incident-list';
import IncidentDetail from '@/pages/incident-detail';
import MedicalList from '@/pages/medical-list';
import NotificationList from '@/pages/notification-list';
import VerificationList from '@/pages/verification-list';
import RefereeList from '@/pages/referee-list';

import PortalHome from '@/pages/portal/home';
import PortalJockeys from '@/pages/portal/jockeys';
import PortalJockeyProfile from '@/pages/portal/jockey-profile';
import PortalTournaments from '@/pages/portal/tournaments';
import PortalTournamentDetail from '@/pages/portal/tournament-detail';
import PortalRaces from '@/pages/portal/races';
import PortalRaceDetail from '@/pages/portal/race-detail';
import PortalLogin from '@/pages/portal/login';
import PortalRegister from '@/pages/portal/register';
import PortalSpectatorProfile from '@/pages/portal/spectator-profile';
import PortalJockeyPortalProfile from '@/pages/portal/jockey-portal-profile';

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const isPortal = location === '/portal' || location.startsWith('/portal/');

  if (isPortal) {
    return (
      <PortalLayout>
        <Switch>
          <Route path="/portal" component={PortalHome} />
          <Route path="/portal/jockeys" component={PortalJockeys} />
          <Route path="/portal/jockeys/:id" component={PortalJockeyProfile} />
          <Route path="/portal/tournaments" component={PortalTournaments} />
          <Route path="/portal/tournaments/:id" component={PortalTournamentDetail} />
          <Route path="/portal/races" component={PortalRaces} />
          <Route path="/portal/races/:id" component={PortalRaceDetail} />
          <Route path="/portal/login" component={PortalLogin} />
          <Route path="/portal/register" component={PortalRegister} />
          <Route path="/portal/profile" component={PortalSpectatorProfile} />
          <Route path="/portal/jockey-profile" component={PortalJockeyPortalProfile} />
          <Route component={NotFound} />
        </Switch>
      </PortalLayout>
    );
  }

  return (
    <SidebarLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jockeys" component={JockeyList} />
        <Route path="/jockeys/:id" component={JockeyProfile} />
        <Route path="/horses" component={HorseList} />
        <Route path="/tournaments" component={TournamentList} />
        <Route path="/tournaments/:id" component={TournamentDetail} />
        <Route path="/races" component={RaceList} />
        <Route path="/races/:id" component={RaceDetail} />
        <Route path="/incidents" component={IncidentList} />
        <Route path="/incidents/:id" component={IncidentDetail} />
        <Route path="/medical" component={MedicalList} />
        <Route path="/notifications" component={NotificationList} />
        <Route path="/verifications" component={VerificationList} />
        <Route path="/referees" component={RefereeList} />
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
