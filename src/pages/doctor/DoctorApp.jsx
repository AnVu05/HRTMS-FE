import React from 'react';
import { Route, Switch } from 'wouter';
import { DoctorLayout } from './DoctorLayout';
import { HealthChecking } from './HealthChecking';

const DummyComponent = ({ title }) => (
  <div className="flex h-full w-full items-center justify-center bg-transparent">
    <h1 className="text-2xl font-bold text-gray-500">
      {title} (Coming Soon)
    </h1>
  </div>
);

export default function DoctorApp() {
  return (
    <DoctorLayout>
      <Switch>
        <Route path="/doctor/health-check" component={HealthChecking} />
        <Route component={HealthChecking} />
      </Switch>
    </DoctorLayout>
  );
}
