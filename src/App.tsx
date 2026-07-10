import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { PortalLayout } from '@/components/layout/portal-layout';
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
import RefereeHome from '@/pages/Referee/home';
import RefereeProfile from '@/pages/Referee/profile';
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

// Auth Pages
import PortalLogin from '@/pages/portal/login';
import PortalRegister from '@/pages/portal/register';

// Guest / Vãng Lai Pages
import GuestHome from '@/pages/portal/guest/home';
import GuestTournaments from '@/pages/portal/guest/tournaments';
import GuestTournamentDetail from '@/pages/portal/guest/tournament-detail';
import GuestRaces from '@/pages/portal/guest/races';
import GuestRaceDetail from '@/pages/portal/guest/race-detail';
import GuestJockeys from '@/pages/portal/guest/jockeys';
import GuestJockeyProfile from '@/pages/portal/guest/jockey-profile';

const queryClient = new QueryClient();

function Router() {
  return (
    <PortalLayout>
      <Switch>
        {/* Auth */}
        <Route path="/portal/login" component={PortalLogin} />
        <Route path="/portal/register" component={PortalRegister} />

        {/* Jockey */}
        <Route path="/portal/jockey/home" component={JockeyHome} />
        <Route path="/portal/jockey/profile" component={JockeyProfile} />
        <Route path="/portal/jockey/tournaments" component={JockeyTournaments} />
        <Route path="/portal/jockey/tournaments/:id" component={JockeyTournamentDetail} />
        <Route path="/portal/jockey/races" component={JockeyRaces} />
        <Route path="/portal/jockey/races/:id" component={JockeyRaceDetail} />
        <Route path="/portal/jockey/jockeys" component={JockeyJockeys} />
        <Route path="/portal/jockey/jockeys/:id" component={JockeyJockeyProfile} />

        {/* Referee */}
        <Route path="/portal/referee/home" component={RefereeHome} />
        <Route path="/portal/referee/profile" component={RefereeProfile} />
        <Route path="/portal/referee/tournaments" component={RefereeTournaments} />
        <Route path="/portal/referee/tournaments/:id" component={RefereeTournamentDetail} />
        <Route path="/portal/referee/races" component={RefereeRaces} />
        <Route path="/portal/referee/races/:id" component={RefereeRaceDetail} />
        <Route path="/portal/referee/jockeys" component={RefereeJockeys} />
        <Route path="/portal/referee/jockeys/:id" component={RefereeJockeyProfile} />

        {/* Spectator */}
        <Route path="/portal/spectator/home" component={SpectatorHome} />
        <Route path="/portal/spectator/profile" component={SpectatorProfile} />
        <Route path="/portal/spectator/tournaments" component={SpectatorTournaments} />
        <Route path="/portal/spectator/tournaments/:id" component={SpectatorTournamentDetail} />
        <Route path="/portal/spectator/races" component={SpectatorRaces} />
        <Route path="/portal/spectator/races/:id" component={SpectatorRaceDetail} />
        <Route path="/portal/spectator/jockeys" component={SpectatorJockeys} />
        <Route path="/portal/spectator/jockeys/:id" component={SpectatorJockeyProfile} />

        {/* Guest / Vãng Lai (No Login) */}
        <Route path="/portal" component={GuestHome} />
        <Route path="/portal/tournaments" component={GuestTournaments} />
        <Route path="/portal/tournaments/:id" component={GuestTournamentDetail} />
        <Route path="/portal/races" component={GuestRaces} />
        <Route path="/portal/races/:id" component={GuestRaceDetail} />
        <Route path="/portal/jockeys" component={GuestJockeys} />
        <Route path="/portal/jockeys/:id" component={GuestJockeyProfile} />

        {/* Default / Fallbacks */}
        <Route path="/" component={GuestHome} />
        <Route component={NotFound} />
      </Switch>
    </PortalLayout>
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
        <DevToggle />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
