import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CalendarClock, CheckCircle, Activity, FileCheck, Users, ShieldAlert } from 'lucide-react';
import adminApi from '@/api/adminApi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#3b82f6', '#94a3b8']; // Blue for Registered, Slate for Empty

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-md text-sm">
        <p className="font-semibold mb-1">Date: {label}</p>
        <p className="text-blue-600 font-medium mb-1">Races: {data.count}</p>
        {data.raceNames && data.raceNames.length > 0 && (
          <ul className="list-disc pl-4 text-slate-600 mt-1">
            {data.raceNames.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  return null;
};


export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getDashboardStats();
        setStats(response);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight mb-4">Dashboard Overview</h2>
      
      {/* Tournament KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tournaments (DRAFT)</CardTitle>
            <CalendarClock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tournamentStats?.upcoming || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Tournaments (PUBLISHED)</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tournamentStats?.ongoing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tournaments (COMPLETE)</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tournamentStats?.completed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.tournamentStats?.upcoming || 0) + 
               (stats?.tournamentStats?.ongoing || 0) + 
               (stats?.tournamentStats?.completed || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Line Chart: Races This Month */}
        <Card>
          <CardHeader>
            <CardTitle>Races This Month</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {stats?.racesThisMonth && stats.racesThisMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.racesThisMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => value.split('-').slice(1).join('/')} 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" name="Races" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart: Fill Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Average Race Fill Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {stats?.raceFillRate && stats.raceFillRate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.raceFillRate}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.raceFillRate.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Horses']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      

    </div>
  );
}
