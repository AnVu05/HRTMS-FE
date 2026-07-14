import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { AdminLayout } from './AdminLayout';
import { Dashboard } from './Dashboard';
import { Tournaments } from './Tournaments';
import { Races } from './Races';
import { Medical } from './Medical';
import { Verifications } from './Verifications';
import { SystemData } from './SystemData';

export default function AdminApp() {
  return (
    <Router base="/admin">
      <AdminLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tournaments" component={Tournaments} />
          <Route path="/races" component={Races} />
          <Route path="/medical" component={Medical} />
          <Route path="/verifications" component={Verifications} />
          <Route path="/system-data" component={SystemData} />
        </Switch>
      </AdminLayout>
    </Router>
  );
}
