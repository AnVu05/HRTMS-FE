import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MapPin, Calendar, DollarSign, Flag, Edit } from 'lucide-react';

const FAKE_RACES = [
  { id: '101', name: 'Opening Sprint', date: 'Oct 15, 2023 - 10:00 AM', status: 'Completed', prize: 50000, distance: '1200m' },
  { id: '102', name: 'Midday Classic', date: 'Oct 15, 2023 - 1:00 PM', status: 'Completed', prize: 75000, distance: '1600m' },
  { id: '103', name: 'Sunset Derby', date: 'Oct 16, 2023 - 4:30 PM', status: 'Active', prize: 150000, distance: '2400m' },
  { id: '104', name: 'Grand Finale', date: 'Oct 20, 2023 - 3:00 PM', status: 'Upcoming', prize: 225000, distance: '3200m' },
];

export default function TournamentDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('races');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-4">
        <Link href="/tournaments">
          <Button variant="outline" size="icon" className="h-9 w-9 mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Hanoi Grand Prix</h2>
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Active</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Oct 15 - Oct 20, 2023</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Hanoi Racecourse</span>
            <span className="flex items-center gap-1.5 font-medium text-foreground"><DollarSign className="h-4 w-4 text-green-600" /> $500,000 Total Prize</span>
          </div>
        </div>
        <Button variant="outline" className="hidden sm:flex gap-2">
          <Edit className="h-4 w-4" /> Edit
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-8">
        <TabsList className="bg-muted/50 w-full justify-start rounded-md h-12 p-1">
          <TabsTrigger value="races" className="data-[state=active]:bg-background rounded px-6 py-2">Races ({FAKE_RACES.length})</TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-background rounded px-6 py-2">Tournament Info</TabsTrigger>
        </TabsList>

        <TabsContent value="races" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Schedule & Results</CardTitle>
              <Button size="sm">Add Race</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Race Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Prize Pool</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAKE_RACES.map((race) => (
                    <TableRow key={race.id}>
                      <TableCell className="font-medium">{race.name}</TableCell>
                      <TableCell className="text-muted-foreground">{race.date}</TableCell>
                      <TableCell>{race.distance}</TableCell>
                      <TableCell className="font-medium">${race.prize.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          race.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                          race.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' :
                          'bg-blue-50 text-blue-700'
                        }>
                          {race.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/races/${race.id}`}>
                          <Button variant="ghost" size="sm">Details</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The Hanoi Grand Prix is the premier event in the Northern racing calendar, drawing top jockeys and elite thoroughbreds 
                from across the region. Spanning five days, the tournament culminates in the 3200m Grand Finale.
              </p>
              <p>
                This year's event features upgraded turf conditions and a record-breaking $500,000 total prize pool, made possible 
                by new regional sponsorships. Strict medical and verification protocols are in effect for all participants.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="font-medium text-foreground mb-1">Chief Referee</p>
                  <p>Mr. Thomas Wayne</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Sponsors</p>
                  <p>VinGroup, Techcombank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
