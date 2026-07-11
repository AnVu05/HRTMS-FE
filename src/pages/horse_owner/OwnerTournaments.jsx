import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ownerApi } from '@/api/ownerApi';

export default function OwnerTournaments() {
  const [filter, setFilter] = useState('All');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await ownerApi.getAllTournaments();
        const tournamentsList = data || [];
        
        // Fetch race count for each tournament
        const tournamentsWithRaces = await Promise.all(
          tournamentsList.map(async (t) => {
            try {
              const raceData = await ownerApi.getRacesByTournament(t.id);
              const raceCount = raceData?.races?.length || 0;
              return { ...t, raceCount };
            } catch (err) {
              return { ...t, raceCount: 0 };
            }
          })
        );
        
        setTournaments(tournamentsWithRaces);
      } catch (err) {
        console.error("Failed to load tournaments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    const status = t.status ? t.status.toUpperCase() : '';
    if (filter === 'All') {
      return ['PUBLISHED', 'COMPLETE', 'DRAFT', 'CANCELLED'].includes(status);
    }
    if (filter === 'Active') {
      return status === 'PUBLISHED';
    }
    if (filter === 'Upcoming') {
      return status === 'DRAFT';
    }
    if (filter === 'Completed') {
      return status === 'COMPLETE';
    }
    return false;
  });

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Racing Tournaments</h1>
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
        <div className="text-center py-20">Loading tournaments...</div>
      ) : (
        <>
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
                        tournament.status === 'PUBLISHED' ? 'bg-green-500 text-white border-none shadow-md' :
                        tournament.status === 'DRAFT' ? 'bg-blue-500 text-white border-none shadow-md' : 
                        'bg-slate-200 text-slate-700 border-none shadow-md'
                      }>
                        {tournament.status}
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg" style={{ color: '#ffffff', opacity: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        {tournament.name}
                      </h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1"></div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div className="text-xs font-semibold text-slate-700">
                          {tournament.start_date ? `Start date: ${tournament.start_date}` : 'Start date: TBD'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-slate-400" />
                        <div className="text-xs font-semibold text-slate-700">{tournament.raceCount || 0} Races</div>
                      </div>

                    </div>
                    
                    <Link href={`/owner-home/tournaments/${tournament.id}`}>
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
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 mt-8">
              <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No tournaments found</h3>
              <p className="text-slate-500 mt-2">There are currently no tournaments matching this status.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
