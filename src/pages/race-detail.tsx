import React from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Trophy, Clock, Ruler, AlertTriangle } from 'lucide-react';

const RESULTS = [
  { position: 1, jockey: 'Nguyễn Văn Minh', horse: 'Thunderbolt', time: '2:14.35', prize: 75000 },
  { position: 2, jockey: 'James O\'Brien', horse: 'Golden Flash', time: '2:14.82', prize: 35000 },
  { position: 3, jockey: 'Emma Richardson', horse: 'Majestic Star', time: '2:15.10', prize: 20000 },
  { position: 4, jockey: 'Luca Bianchi', horse: 'Silver Bullet', time: '2:15.45', prize: 10000 },
  { position: 5, jockey: 'Takeshi Yamamoto', horse: 'Desert Wind', time: '2:16.20', prize: 5000 },
  { position: 6, jockey: 'Ahmed Al-Rashid', horse: 'Storm Rider', time: '2:17.05', prize: 5000 },
];

export default function RaceDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-4">
        <Link href="/races">
          <Button variant="outline" size="icon" className="h-9 w-9 mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Sunset Derby</h2>
            <Badge variant="outline" className="w-fit bg-gray-100 text-gray-700">Completed</Badge>
          </div>
          <p className="text-muted-foreground mt-1">Hanoi Grand Prix • Oct 16, 2023</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <AlertTriangle className="h-4 w-4" /> Report Incident
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <Ruler className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Distance</p>
              <p className="text-lg font-semibold">2400m</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Winning Time</p>
              <p className="text-lg font-semibold">2:14.35</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Prize</p>
              <p className="text-lg font-semibold">$150,000</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Official Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">Pos</TableHead>
                <TableHead>Jockey</TableHead>
                <TableHead>Horse</TableHead>
                <TableHead className="text-right">Finish Time</TableHead>
                <TableHead className="text-right">Prize Won</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RESULTS.map((result) => (
                <TableRow key={result.position} className={result.position === 1 ? 'bg-amber-500/5 hover:bg-amber-500/10' : ''}>
                  <TableCell className="text-center">
                    <Badge variant={result.position === 1 ? 'default' : result.position <= 3 ? 'secondary' : 'outline'}
                      className={result.position === 1 ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}>
                      {result.position}{result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{result.jockey}</TableCell>
                  <TableCell>{result.horse}</TableCell>
                  <TableCell className="text-right font-mono">{result.time}</TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-500">
                    ${result.prize.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
