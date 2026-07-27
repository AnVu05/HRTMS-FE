import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { OwnerLayout } from './OwnerLayout';
import OwnerHome from './OwnerHome';
import OwnerJockeys from './OwnerJockeys';
import OwnerTournaments from './OwnerTournaments';
import OwnerTournamentDetail from './OwnerTournamentDetail';
import OwnerRaceDetail from './OwnerRaceDetail';
import OwnerProfile from './OwnerProfile';
import { OwnerManagementLayout } from './OwnerManagementLayout';
import OwnerHorses from './OwnerHorses';
import OwnerRegistrations from './OwnerRegistrations';

export default function OwnerApp() {
  const [location] = useLocation();
  const isManagement = location.startsWith('/owner-management');

  if (isManagement) {
    return (
      <OwnerManagementLayout>
        <Switch>
          <Route path="/owner-management/horses" component={OwnerHorses} />
          <Route path="/owner-management/registrations" component={OwnerRegistrations} />
          <Route component={OwnerHorses} />
        </Switch>
      </OwnerManagementLayout>
    );
  }

  return (
    <OwnerLayout>
      <Switch>
        <Route path="/owner-home" component={OwnerHome} />
        <Route path="/owner-home/jockeys" component={OwnerJockeys} />
        <Route path="/owner-home/tournaments" component={OwnerTournaments} />
        <Route path="/owner-home/tournaments/:id" component={OwnerTournamentDetail} />
        <Route path="/owner-home/races/:id" component={OwnerRaceDetail} />
        <Route path="/owner-home/profile" component={OwnerProfile} />
        <Route component={OwnerHome} />
      </Switch>
    </OwnerLayout>
  );
}
