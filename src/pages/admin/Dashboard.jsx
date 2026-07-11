import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Activity, FileCheck, Users, ShieldAlert } from 'lucide-react';

export function Dashboard() {
  const statCards = [
    { title: "Total Tournaments", value: 0, icon: Trophy, color: "text-blue-500" },
    { title: "Active Races", value: 0, icon: Activity, color: "text-green-500" },
    { title: "Pending Verifications", value: 0, icon: ShieldAlert, color: "text-yellow-500" },
    { title: "Pending Registrations", value: 0, icon: FileCheck, color: "text-orange-500" },
    { title: "New Users", value: 0, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p className="py-2 border-b">New tournament "Summer Derby 2026" created.</p>
              <p className="py-2 border-b">Jockey "John Doe" submitted certificate.</p>
              <p className="py-2">User "Sarah Connor" registered as DOCTOR.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
