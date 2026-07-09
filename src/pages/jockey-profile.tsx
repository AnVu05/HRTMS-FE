import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, User, Trophy, Activity, Calendar } from 'lucide-react';
import { JOCKEYS } from './jockey-list';

// Horses aligned with HorseResponse — status uses HorseStatus enum: WORK | INJURED | RETIRED
const FAKE_HORSES = [
  { id: '1', name: 'Thunderbolt', breed: 'Thoroughbred', weightKg: 480, sex: 'Male', status: 'WORK' as const },
  { id: '2', name: 'Midnight Shadow', breed: 'Arabian', weightKg: 455, sex: 'Male', status: 'WORK' as const },
  { id: '3', name: 'Golden Flash', breed: 'Thoroughbred', weightKg: 490, sex: 'Female', status: 'INJURED' as const },
];

// RacePlacement — aligned with RacePlacementResponse / RegistrationForm
const FAKE_PLACEMENTS = [
  { id: '1', date: '2023-10-15', tournamentName: 'Hanoi Grand Prix', raceName: 'Opening Sprint', finishPosition: 1, distanceM: 1200 },
  { id: '2', date: '2023-09-22', tournamentName: 'Saigon Sprint', raceName: 'Championship', finishPosition: 3, distanceM: 2000 },
  { id: '3', date: '2023-08-10', tournamentName: 'Da Nang Classic', raceName: 'Coast Run', finishPosition: 1, distanceM: 1400 },
  { id: '4', date: '2023-07-05', tournamentName: 'Summer Cup', raceName: 'Summer Special', finishPosition: 2, distanceM: 1600 },
  { id: '5', date: '2023-06-18', tournamentName: 'Asian Masters', raceName: 'Masters Final', finishPosition: 4, distanceM: 2400 },
];

const posLabel = (p: number) => p === 1 ? '1st' : p === 2 ? '2nd' : p === 3 ? '3rd' : `${p}th`;

export default function JockeyProfile() {
  const { id } = useParams();
  const jockey = JOCKEYS.find(j => j.id === id) || JOCKEYS[0];
  const [activeTab, setActiveTab] = useState('overview');

  const wins = FAKE_PLACEMENTS.filter(p => p.finishPosition === 1).length;
  const winRate = Math.round((wins / FAKE_PLACEMENTS.length) * 100);

  const statusClass =
    jockey.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
    jockey.status === 'INACTIVE' ? 'bg-red-50 text-red-700 border-red-200' :
    'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/jockeys">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{jockey.jockeyName}</h2>
            <Badge variant="outline" className={statusClass}>{jockey.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <span className="font-mono">@{jockey.username}</span>
            <span>•</span>
            <span>{jockey.email}</span>
            <span>•</span>
            <span>Age {jockey.age}</span>
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 w-full justify-start rounded-md h-12 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background rounded px-6 py-2">Overview</TabsTrigger>
          <TabsTrigger value="horses" className="data-[state=active]:bg-background rounded px-6 py-2">Associated Horses</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-background rounded px-6 py-2">Race History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary"><Activity className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Races</p>
                    <h3 className="text-2xl font-bold">{FAKE_PLACEMENTS.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500"><Trophy className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Wins</p>
                    <h3 className="text-2xl font-bold">{wins}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><Activity className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Win Rate</p>
                    <h3 className="text-2xl font-bold">{winRate}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Calendar className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Experience</p>
                    <h3 className="text-2xl font-bold">{jockey.experienceYears} yrs</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {jockey.professionalBio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{jockey.professionalBio}</p>
                )}
                <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-border mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium font-mono">@{jockey.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{jockey.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{jockey.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{jockey.experienceYears} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-medium">{jockey.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">JOCKEY</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Key Achievements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Hanoi Grand Prix — 1st Place</p>
                      <p className="text-xs text-muted-foreground">2023</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Summer Special — 2nd Place</p>
                      <p className="text-xs text-muted-foreground">2023</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{jockey.experienceYears} Years Experience</p>
                      <p className="text-xs text-muted-foreground">Active professional career</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Horses Tab — uses HorseStatus: WORK | INJURED | RETIRED */}
        <TabsContent value="horses" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Associated Horses</CardTitle>
              <CardDescription>Horses from registration forms linked to this jockey.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horse Name</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead className="text-right">Weight (kg)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAKE_HORSES.map(horse => (
                    <TableRow key={horse.id}>
                      <TableCell className="font-medium">{horse.name}</TableCell>
                      <TableCell className="text-muted-foreground">{horse.breed}</TableCell>
                      <TableCell>{horse.sex}</TableCell>
                      <TableCell className="text-right font-mono">{horse.weightKg}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          horse.status === 'WORK' ? 'bg-green-50 text-green-700 border-green-200' :
                          horse.status === 'INJURED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }>
                          {horse.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Race History Tab — uses RacePlacement data */}
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Race Placements</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Race</TableHead>
                    <TableHead className="text-right">Distance (m)</TableHead>
                    <TableHead className="text-center">Finish Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAKE_PLACEMENTS.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{p.date}</TableCell>
                      <TableCell className="font-medium">{p.tournamentName}</TableCell>
                      <TableCell className="text-muted-foreground">{p.raceName}</TableCell>
                      <TableCell className="text-right font-mono">{p.distanceM.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={p.finishPosition === 1 ? 'default' : p.finishPosition <= 3 ? 'secondary' : 'outline'}
                          className={p.finishPosition === 1 ? 'bg-amber-500 text-white' : ''}
                        >
                          {posLabel(p.finishPosition)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
