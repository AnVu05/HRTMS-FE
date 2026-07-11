import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jockeyService } from '@/services/jockey.service';

const getAvatarSrc = (avatar: string | null) => {
  if (!avatar) return null;
  if (avatar.startsWith('data:image/') || avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
    return avatar;
  }
  if (/^[A-Za-z0-9+/=]+$/.test(avatar)) {
    return `data:image/png;base64,${avatar}`;
  }
  return avatar;
};

export default function PortalJockeys() {
  const [jockeys, setJockeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    jockeyService.getAllJockeys()
      .then(response => {
        // response.data could be the array of jockeys
        const list = response.data || response || [];
        setJockeys(list);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch jockeys');
        setLoading(false);
      });
  }, []);

  const normalizedJockeys = jockeys.map(jockey => ({
    id: String(jockey.id),
    name: jockey.jockeyName || jockey.username || 'Unknown',
    nationality: jockey.nationality || 'Vietnam 🇻🇳',
    license: jockey.license || 'N/A',
    status: jockey.status === 'ACTIVE' ? 'Active' : 
            jockey.status === 'SUSPENDED' ? 'Suspended' : 
            jockey.status === 'RETIRED' ? 'Retired' : 
            (jockey.status || 'Active'),
    winRate: jockey.winRate || 0,
    earnings: jockey.earnings || 0,
    avatar: jockey.avatar || null
  }));

  const filteredJockeys = normalizedJockeys.filter(jockey => {
    const matchesSearch = jockey.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          jockey.nationality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                          jockey.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-slate-500">Loading jockeys directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Trophy className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">Failed to load jockeys</h3>
        <p className="text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Jockeys Directory</h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Browse the profiles and track records of our elite professional jockeys from around the world.
          </p>
        </div>
      </div>

      <Card className="mb-10 bg-white border-slate-200 shadow-sm">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search by name or nationality..." 
              className="pl-10 h-11 text-base bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-jockeys"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 bg-slate-50 border-slate-200" data-testid="filter-status">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredJockeys.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No jockeys found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJockeys.map((jockey, index) => (
            <motion.div
              key={jockey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow bg-white overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-4">
                      {getAvatarSrc(jockey.avatar) ? (
                        <img 
                          src={getAvatarSrc(jockey.avatar)!} 
                          alt={jockey.name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-2xl shadow-sm">
                          {jockey.nationality.split(' ')[1]}
                        </div>
                      )}
                      <Badge className={
                        jockey.status === 'Active' ? 'bg-green-500 hover:bg-green-600' :
                        jockey.status === 'Suspended' ? 'bg-red-500 hover:bg-red-600' : 
                        'bg-slate-500 hover:bg-slate-600'
                      }>
                        {jockey.status}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                      {jockey.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {jockey.nationality.split(' ')[0]} • Lic: {jockey.license}
                    </p>
                  </div>
                  
                  <div className="p-6 pt-5">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-slate-600 font-medium">Win Rate</span>
                          <span className="font-bold text-slate-900">{jockey.winRate}%</span>
                        </div>
                        <Progress value={jockey.winRate} className="h-2 bg-slate-100" />
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-slate-600 text-sm font-medium">Total Earnings</span>
                        <span className="font-bold text-primary flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 opacity-70" />
                          ${jockey.earnings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <Link href={`/spectator/jockeys/${jockey.id}`}>
                      <Button className="w-full mt-6 bg-slate-900 hover:bg-primary hover:text-primary-foreground text-white transition-colors" data-testid={`btn-view-jockey-${jockey.id}`}>
                        View Full Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
