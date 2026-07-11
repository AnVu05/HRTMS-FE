import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_TOURNAMENTS = [
  { id: '1', name: 'Hanoi Grand Prix', location: 'Ho Chi Minh City', status: 'Active', prize: 500000, date: 'Oct 15-20 2023', raceCount: 8, maxParticipants: 24, description: 'The premier event of the season featuring the best horses in Southeast Asia.' },
  { id: '2', name: 'Saigon Sprint Series', location: 'Hanoi', status: 'Upcoming', prize: 350000, date: 'Nov 5-8 2023', raceCount: 6, maxParticipants: 20, description: 'A high-speed sprint series testing agility and endurance.' },
  { id: '3', name: 'Mekong Valley Classic', location: 'Da Nang', status: 'Completed', prize: 280000, date: 'Sep 10-14 2023', raceCount: 5, maxParticipants: 16, description: 'A classic mid-season tournament held in the scenic Mekong Valley.' },
  { id: '4', name: 'Central Highlands Derby', location: 'Buon Ma Thuot', status: 'Upcoming', prize: 420000, date: 'Dec 1-5 2023', raceCount: 7, maxParticipants: 24, description: 'Challenging elevation and cooler climates test both jockey and horse.' },
  { id: '5', name: 'Coastal Cup', location: 'Nha Trang', status: 'Completed', prize: 195000, date: 'Aug 20-22 2023', raceCount: 4, maxParticipants: 12, description: 'A beautiful coastal track offering fast flat races.' },
  { id: '6', name: 'Northern Championship', location: 'Hanoi', status: 'Upcoming', prize: 600000, date: 'Jan 15-20 2024', raceCount: 10, maxParticipants: 32, description: 'The ultimate championship closing out the racing year.' }
];

export default function PortalTournaments() {
  const [filter, setFilter] = useState('All');

  const filteredTournaments = MOCK_TOURNAMENTS.filter(t => filter === 'All' || t.status === filter);

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4 text-slate-400">Racing Tournaments</h1>
        <p className="text-lg text-slate-500">
          Discover prestigious racing events across the country. Follow active championships, review past results, and prepare for upcoming cups.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <Tabs defaultValue="All" className="w-full max-w-2xl" onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-slate-100 rounded-xl">
            <TabsTrigger value="All" className="rounded-lg font-medium">All Events</TabsTrigger>
            <TabsTrigger value="Active" className="rounded-lg font-medium">Active</TabsTrigger>
            <TabsTrigger value="Upcoming" className="rounded-lg font-medium">Upcoming</TabsTrigger>
            <TabsTrigger value="Completed" className="rounded-lg font-medium">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTournaments.map((tournament, idx) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className="h-full bg-white border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-90"></div>
                {/* Abstract pattern placeholder instead of image */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <Badge className={
                    tournament.status === 'Active' ? 'bg-green-500 text-white border-none shadow-md' :
                    tournament.status === 'Upcoming' ? 'bg-blue-500 text-white border-none shadow-md' : 
                    'bg-slate-200 text-slate-700 border-none shadow-md'
                  }>
                    {tournament.status}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold border border-white/20 shadow-lg">
                  ${tournament.prize.toLocaleString()} Pool
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md group-hover:text-primary transition-colors">
                    {tournament.name}
                  </h3>
                  <p className="text-slate-300 text-sm font-medium flex items-center gap-1.5 drop-shadow-sm">
                    <MapPin className="h-3.5 w-3.5" /> {tournament.location}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1 flex flex-col">
                <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">
                  {tournament.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div className="text-xs font-semibold text-slate-700">{tournament.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-slate-400" />
                    <div className="text-xs font-semibold text-slate-700">{tournament.raceCount} Races</div>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div className="text-xs font-semibold text-slate-700">Max {tournament.maxParticipants} Participants</div>
                  </div>
                </div>
                
                <Link href={`/jockey/tournaments/${tournament.id}`}>
                  <Button className="w-full bg-slate-50 hover:bg-primary text-slate-900 hover:text-primary-foreground border border-slate-200 transition-colors" data-testid={`btn-view-tournament-${tournament.id}`}>
                    View Tournament Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {filteredTournaments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No tournaments found</h3>
          <p className="text-slate-500 mt-2">There are currently no tournaments matching this status.</p>
        </div>
      )}
    </div>
  );
}
