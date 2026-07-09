import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';

const INCIDENTS = [
  { id: 'INC-142', type: 'Whip Violation', jockey: 'Carlos Mendez', race: 'Midday Classic', severity: 'Medium', status: 'Open', date: 'Oct 15, 2023' },
  { id: 'INC-143', type: 'Interference', jockey: 'Ahmed Al-Rashid', race: 'Sunset Derby', severity: 'High', status: 'Under Review', date: 'Oct 16, 2023' },
  { id: 'INC-144', type: 'Weight Discrepancy', jockey: 'Takeshi Yamamoto', race: 'Opening Sprint', severity: 'Critical', status: 'Resolved', date: 'Oct 15, 2023' },
  { id: 'INC-145', type: 'Late Arrival', jockey: 'Luca Bianchi', race: 'Opening Sprint', severity: 'Low', status: 'Resolved', date: 'Oct 15, 2023' },
  { id: 'INC-146', type: 'Medical Emergency', jockey: 'Park Ji-won', race: 'Training', severity: 'Critical', status: 'Open', date: 'Oct 17, 2023' },
  { id: 'INC-147', type: 'Equipment Failure', jockey: 'Emma Richardson', race: 'Midday Classic', severity: 'Medium', status: 'Under Review', date: 'Oct 15, 2023' },
];

export default function IncidentList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filtered = INCIDENTS.filter(inc => {
    const sMatch = statusFilter === 'All' || inc.status === statusFilter;
    const sevMatch = severityFilter === 'All' || inc.severity === severityFilter;
    return sMatch && sevMatch;
  });

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Under Review': return 'bg-primary/10 text-primary border-primary/20';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incidents</h2>
          <p className="text-muted-foreground mt-1">Track and manage rule violations, appeals, and accidents.</p>
        </div>
        <Button className="font-semibold shadow-sm" variant="destructive">
          Log Incident
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-end bg-muted/20">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Severities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Jockey</TableHead>
                <TableHead>Race/Event</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inc) => (
                <TableRow key={inc.id} className="group hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{inc.id}</TableCell>
                  <TableCell className="font-medium">{inc.type}</TableCell>
                  <TableCell>{inc.jockey}</TableCell>
                  <TableCell className="text-muted-foreground">{inc.race}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityBadge(inc.severity)}>
                      {inc.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadge(inc.status)}>
                      {inc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{inc.date}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/incidents/${inc.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
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
