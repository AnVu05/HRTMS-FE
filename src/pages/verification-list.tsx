import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Check, X, FileSearch } from 'lucide-react';

// Aligns with JockeyCert entity
// CertificateStatus enum: PENDING | VERIFIED | REJECTED | DELETE
export interface JockeyCertRecord {
  id: string;
  jockeyId: number;
  jockeyName: string;   // resolved from jockey relation
  certName: string;     // `cert_name` column
  issuedAt: string;     // `issued_at` LocalDate → "YYYY-MM-DD"
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DELETE';
}

// Mock data matching JockeyCert entity shape
const INITIAL_CERTS: JockeyCertRecord[] = [
  { id: '1', jockeyId: 3, jockeyName: 'Takeshi Yamamoto', certName: 'License Renewal', issuedAt: '2023-10-18', status: 'PENDING' },
  { id: '2', jockeyId: 1, jockeyName: 'Nguyễn Văn Minh', certName: 'Medical Certificate', issuedAt: '2023-10-17', status: 'PENDING' },
  { id: '3', jockeyId: 5, jockeyName: 'Emma Richardson', certName: 'Visa Document', issuedAt: '2023-10-15', status: 'VERIFIED' },
  { id: '4', jockeyId: 4, jockeyName: 'Carlos Mendez', certName: 'Reinstatement Form', issuedAt: '2023-10-14', status: 'REJECTED' },
  { id: '5', jockeyId: 8, jockeyName: 'Luca Bianchi', certName: 'License Renewal', issuedAt: '2023-10-10', status: 'VERIFIED' },
  { id: '6', jockeyId: 7, jockeyName: 'Park Ji-won', certName: 'Medical Certificate', issuedAt: '2023-10-09', status: 'VERIFIED' },
  { id: '7', jockeyId: 6, jockeyName: 'Ahmed Al-Rashid', certName: 'Registration Form', issuedAt: '2023-10-05', status: 'VERIFIED' },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function VerificationList() {
  const [certs, setCerts] = useState(INITIAL_CERTS);
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = certs.filter(c =>
    statusFilter === 'All' || c.status === statusFilter
  );

  const updateStatus = (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setCerts(certs.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Verifications</h2>
          <p className="text-muted-foreground mt-1">Review jockey certificate submissions (JockeyCert).</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex justify-end bg-muted/20">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cert ID</TableHead>
                <TableHead>Jockey</TableHead>
                <TableHead>Certificate Name (certName)</TableHead>
                <TableHead>Issued At (issuedAt)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No certificates found.</TableCell></TableRow>
              ) : filtered.map(cert => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">#{cert.id}</TableCell>
                  <TableCell className="font-medium">{cert.jockeyName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{cert.certName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(cert.issuedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      cert.status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' :
                      cert.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {cert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {cert.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" title="Review Document">
                          <FileSearch className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="outline" size="icon"
                          className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                          title="Verify"
                          onClick={() => updateStatus(cert.id, 'VERIFIED')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline" size="icon"
                          className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Reject"
                          onClick={() => updateStatus(cert.id, 'REJECTED')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="font-medium">View Details</Button>
                    )}
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
