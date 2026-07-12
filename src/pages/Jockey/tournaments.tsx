import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ownerApi } from '@/services/owner.service';

export default function PortalTournaments() {
  const [filter, setFilter] = useState('All');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await ownerApi.getAllTournaments();
      const list = res.data || res || [];
      if (Array.isArray(list)) {
        const mapped = list.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          location: t.location || 'Vietnam',
          status: t.status === 'ACTIVE' ? 'Active' : t.status === 'UPCOMING' ? 'Upcoming' : t.status === 'COMPLETED' ? 'Completed' : t.status || 'Upcoming',
          
          date: t.start_date && t.end_date ? `${t.start_date} - ${t.end_date}` : 'TBD',
          raceCount: t.raceCount || 8,
          maxParticipants: t.maxParticipants || 24,
          description: t.description || 'Professional horse racing tournament.'
        }));
        setTournaments(mapped);
      } else {
        setTournaments([]);
      }
    } catch (err) {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(t => filter === 'All' || t.status === filter);

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

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-10 w-10 animate-spin text-slate-400" />
        </div>
      ) : (
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
      )}
      
      {!loading && filteredTournaments.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No tournaments found</h3>
          <p className="text-slate-500 mt-2">There are currently no tournaments matching this status.</p>
        </div>
      )}
    </div>
  );
}
