import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Calendar, Flag, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_RACES = [
  { id: '1', name: 'Opening Sprint', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 15 2023', distance: '1200m', condition: 'Fast', prize: 50000, status: 'Completed' },
  { id: '2', name: 'Middle Distance Challenge', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 17 2023', distance: '1600m', condition: 'Good', prize: 75000, status: 'In Progress' },
  { id: '3', name: 'Grand Prix Final', tournamentId: '1', tournamentName: 'Hanoi Grand Prix', date: 'Oct 20 2023', distance: '2400m', condition: 'Fast', prize: 200000, status: 'Scheduled' },
  { id: '4', name: 'Sprint Heat 1', tournamentId: '2', tournamentName: 'Saigon Sprint Series', date: 'Nov 5 2023', distance: '1000m', condition: 'Good', prize: 30000, status: 'Scheduled' },
  { id: '5', name: 'Sprint Heat 2', tournamentId: '2', tournamentName: 'Saigon Sprint Series', date: 'Nov 6 2023', distance: '1000m', condition: 'Good', prize: 30000, status: 'Scheduled' },
  { id: '6', name: 'Valley Qualifier', tournamentId: '3', tournamentName: 'Mekong Valley Classic', date: 'Sep 10 2023', distance: '1400m', condition: 'Yielding', prize: 40000, status: 'Completed' },
  { id: '7', name: 'Valley Cup', tournamentId: '3', tournamentName: 'Mekong Valley Classic', date: 'Sep 14 2023', distance: '2000m', condition: 'Soft', prize: 100000, status: 'Completed' },
  { id: '8', name: 'Highlands Opener', tournamentId: '4', tournamentName: 'Central Highlands Derby', date: 'Dec 1 2023', distance: '1600m', condition: 'Fast', prize: 60000, status: 'Scheduled' },
];

export default function PortalRaces() {
  const [filter, setFilter] = useState('All');

  const filteredRaces = MOCK_RACES.filter(r => filter === 'All' || r.status === filter);

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3 text-slate-400">Race Schedule</h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Complete schedule of all upcoming races, live events, and past results.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Tabs defaultValue="All" className="w-full md:w-auto" onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:flex h-11 bg-slate-100">
            <TabsTrigger value="All" className="px-6 rounded-md">All Races</TabsTrigger>
            <TabsTrigger value="Scheduled" className="px-6 rounded-md">Scheduled</TabsTrigger>
            <TabsTrigger value="In Progress" className="px-6 rounded-md flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </TabsTrigger>
            <TabsTrigger value="Completed" className="px-6 rounded-md">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredRaces.map((race, idx) => (
          <motion.div
            key={race.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <Card className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${race.status === 'In Progress' ? 'border-l-green-500 shadow-sm' :
                race.status === 'Scheduled' ? 'border-l-blue-500' :
                  'border-l-slate-300'
              }`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">

                  {/* Date & Time Block */}
                  <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-6 md:w-48 shrink-0 flex flex-col justify-center items-center text-center">
                    <Calendar className="h-5 w-5 text-slate-400 mb-2" />
                    <div className="font-bold text-slate-900">{race.date.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-sm text-slate-500">{race.date.split(' ')[2]}</div>
                  </div>

                  {/* Main Info */}
                  <div className="p-6 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-slate-100 border-none text-slate-600 font-medium tracking-wide rounded-sm">
                            {race.tournamentName}
                          </Badge>
                          {race.status === 'In Progress' && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse">LIVE NOW</Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{race.name}</h3>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Prize Purse</div>
                        <div className="text-xl font-bold text-amber-600">${race.prize.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Flag className="h-4 w-4 text-slate-400" /> {race.distance}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        Track: <span className="font-medium text-slate-800">{race.condition}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                      <Badge className={
                        race.status === 'Completed' ? 'bg-slate-200 text-slate-700' :
                          race.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'hidden'
                      }>
                        {race.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="p-6 pt-0 md:pt-6 flex items-center justify-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 bg-white md:w-40 shrink-0">
                    <Link href={`/jockey/races/${race.id}`} className="w-full">
                      <Button variant="outline" className="w-full bg-white hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" data-testid={`btn-view-race-${race.id}`}>
                        {race.status === 'Completed' ? 'Results' : 'Details'}
                      </Button>
                    </Link>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredRaces.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No races found</h3>
            <p className="text-slate-500 mt-2">There are currently no races matching this status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
