import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, AlertTriangle, User, Flag, Calendar, CheckCircle2, FileText } from 'lucide-react';

export default function IncidentDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState('Under Review');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-4">
        <Link href="/incidents">
          <Button variant="outline" size="icon" className="h-9 w-9 mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Interference Violation</h2>
            <Badge variant="outline" className="w-fit bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400">High Severity</Badge>
          </div>
          <p className="text-muted-foreground mt-1 font-mono">{id || 'INC-143'}</p>
        </div>
        <div className="flex gap-2">
          {status !== 'Resolved' && (
            <Button onClick={() => setStatus('Resolved')} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="h-4 w-4" /> Mark Resolved
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground">
                During the final stretch (approx 400m mark) of the Sunset Derby, jockey Ahmed Al-Rashid shifted his mount sharply to the left, 
                impeding the path of jockey Luca Bianchi on Silver Bullet. This forced Bianchi to check his horse, costing significant momentum 
                and arguably affecting the final placement.
              </p>
              <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reported By</p>
                  <p className="text-sm">Track Steward, Turn 4</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Evidentiary Material</p>
                  <p className="text-sm flex items-center gap-2 text-primary cursor-pointer hover:underline">
                    <FileText className="h-4 w-4" /> Camera Angle C (Video)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolution & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Chief Referee Note</span>
                  <span className="text-xs text-muted-foreground">Oct 16, 2023 - 5:45 PM</span>
                </div>
                <p className="text-sm text-muted-foreground">Summoned jockey for a hearing on Oct 17. Video evidence clearly shows lateral movement without proper clearance.</p>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Add New Note</label>
                <Textarea placeholder="Type resolution or update notes here..." rows={4} />
                <div className="flex justify-end pt-2">
                  <Button variant="secondary">Add Note</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 bg-muted rounded">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <Badge variant="outline" className={status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary border-primary/20'}>
                    {status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 bg-muted rounded">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subject Jockey</p>
                  <Link href="/jockeys/6" className="text-sm font-medium text-primary hover:underline">
                    Ahmed Al-Rashid
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 bg-muted rounded">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Race</p>
                  <Link href="/races/103" className="text-sm font-medium text-primary hover:underline">
                    Sunset Derby (Oct 16)
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date Reported</p>
                  <p className="text-sm font-medium">Oct 16, 2023 - 4:45 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
