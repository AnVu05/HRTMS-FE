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
import { ownerApi } from '@/api/ownerApi';

export default function OwnerJockeys() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJockeys = async () => {
      try {
        const data = await ownerApi.getJockeys();
        setJockeys(data || []);
      } catch (err) {
        console.error("Failed to load jockeys", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJockeys();
  }, []);

  const filteredJockeys = jockeys.filter(jockey => {
    const name = jockey.jockeyName || jockey.username || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    // Assuming status might be user status or jockey status. For now we just filter by ACTIVE etc.
    const jockeyStatus = jockey.status || 'Active';
    const matchesStatus = statusFilter === 'All' || jockeyStatus.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

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
              placeholder="Search by name..." 
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
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading jockeys...</div>
      ) : filteredJockeys.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No jockeys found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJockeys.map((jockey, index) => {
            const name = jockey.jockeyName || jockey.username;
            const status = jockey.status || 'ACTIVE';
            return (
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
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-2xl shadow-sm">
                          🏇
                        </div>
                        <Badge className={
                          status.toUpperCase() === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' :
                          status.toUpperCase() === 'INACTIVE' ? 'bg-red-500 hover:bg-red-600' : 
                          'bg-slate-500 hover:bg-slate-600'
                        }>
                          {status}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                        {name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Age: {jockey.age || 'N/A'} • Exp: {jockey.experienceYears || 0} yrs
                      </p>
                    </div>
                    
                    <div className="p-6 pt-5">
                      <Link href={`/owner-home/jockeys/${jockey.id}`}>
                        <Button className="w-full mt-6 bg-slate-900 hover:bg-primary hover:text-primary-foreground text-white transition-colors" data-testid={`btn-view-jockey-${jockey.id}`}>
                          View Full Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
