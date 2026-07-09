import React from 'react';
import { Route, Switch } from 'wouter';
import { AdminLayout } from './AdminLayout';
import { Dashboard } from './Dashboard';
import { Tournaments } from './Tournaments';
import { Races } from './Races';
import { Medical } from './Medical';
import { Verifications } from './Verifications';
import { SystemData } from './SystemData';

export default function AdminApp() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/tournaments" component={Tournaments} />
        <Route path="/admin/races" component={Races} />
        <Route path="/admin/medical" component={Medical} />
        <Route path="/admin/verifications" component={Verifications} />
        <Route path="/admin/system-data" component={SystemData} />
      </Switch>
    </AdminLayout>
  );
}
