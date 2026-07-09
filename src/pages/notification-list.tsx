import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, FileText, AlertTriangle, CheckCircle, HeartPulse, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

// Aligns with NotificationResponse DTO
// NotificationStatus enum: UNREAD | READ
// NotificationType enum (partial): VERIFI_CERTIFICATE | ACCEPT_CERTIFICATE | REJECT_CERTIFICATE |
//   NEW_TOURNAMENT | TOURNAMENT_CANCELLED | NEW_RACE | RACE_CANCELLED |
//   DOCTOR_ACCEPTED | DOCTOR_REJECTED | SYSTEM | READY_RACING ...
export interface NotificationRecord {
  id: number;
  senderId: number | null;
  title: string;
  content: string;
  createdAt: string;            // LocalDateTime
  type: string;                 // NotificationType enum value
  raceId: number | null;
  recipientId: number | null;
  recipientRecordId: number | null;
  status: 'UNREAD' | 'READ';   // NotificationStatus enum
  readAt: string | null;
}

// Mock data matching NotificationResponse shape
const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  { id: 1, senderId: null, title: 'Race Incident Reported', content: 'An equipment failure was reported during the Midday Classic race.', createdAt: '2023-10-18T08:50:00', type: 'SYSTEM', raceId: 102, recipientId: 1, recipientRecordId: 1, status: 'UNREAD', readAt: null },
  { id: 2, senderId: 3, title: 'Certificate Verification Request', content: 'Takeshi Yamamoto submitted updated license documentation for review.', createdAt: '2023-10-18T08:00:00', type: 'VERIFI_CERTIFICATE', raceId: null, recipientId: 1, recipientRecordId: 2, status: 'UNREAD', readAt: null },
  { id: 3, senderId: null, title: 'Medical Evaluation Pending', content: 'Park Ji-won requires post-incident health check (registrationFormId: 16).', createdAt: '2023-10-18T07:00:00', type: 'DOCTOR_INVITATION', raceId: null, recipientId: 1, recipientRecordId: 3, status: 'UNREAD', readAt: null },
  { id: 4, senderId: 1, title: 'Tournament Published', content: 'Hanoi Grand Prix has been published and is now open for registration.', createdAt: '2023-10-17T10:00:00', type: 'NEW_TOURNAMENT', raceId: null, recipientId: null, recipientRecordId: 4, status: 'READ', readAt: '2023-10-17T11:00:00' },
  { id: 5, senderId: null, title: 'System Maintenance', content: 'HRTMS will undergo scheduled maintenance on Sunday at 02:00 AM.', createdAt: '2023-10-16T09:00:00', type: 'SYSTEM', raceId: null, recipientId: null, recipientRecordId: 5, status: 'READ', readAt: '2023-10-16T10:00:00' },
  { id: 6, senderId: 1, title: 'Certificate Verified', content: 'License renewal for Emma Richardson has been verified.', createdAt: '2023-10-15T15:00:00', type: 'ACCEPT_CERTIFICATE', raceId: null, recipientId: 5, recipientRecordId: 6, status: 'READ', readAt: '2023-10-15T16:00:00' },
  { id: 7, senderId: null, title: 'Health Check Accepted', content: 'Dr. Smith accepted the health check for Carlos Mendez.', createdAt: '2023-10-14T12:00:00', type: 'DOCTOR_ACCEPTED', raceId: null, recipientId: 4, recipientRecordId: 7, status: 'READ', readAt: '2023-10-14T13:00:00' },
  { id: 8, senderId: 1, title: 'New Race Scheduled', content: 'Grand Finale race has been added to Hanoi Grand Prix tournament.', createdAt: '2023-10-13T10:00:00', type: 'NEW_RACE', raceId: 104, recipientId: null, recipientRecordId: 8, status: 'READ', readAt: '2023-10-13T11:00:00' },
];

// Map NotificationType → icon + color
const TYPE_META: Record<string, { icon: React.ElementType; color: string }> = {
  VERIFI_CERTIFICATE: { icon: FileText, color: 'text-blue-500' },
  ACCEPT_CERTIFICATE: { icon: CheckCircle, color: 'text-green-500' },
  REJECT_CERTIFICATE: { icon: AlertTriangle, color: 'text-red-500' },
  NEW_TOURNAMENT: { icon: Trophy, color: 'text-primary' },
  TOURNAMENT_CANCELLED: { icon: AlertTriangle, color: 'text-red-500' },
  NEW_RACE: { icon: Trophy, color: 'text-primary' },
  RACE_CANCELLED: { icon: AlertTriangle, color: 'text-red-500' },
  DOCTOR_ACCEPTED: { icon: CheckCircle, color: 'text-green-500' },
  DOCTOR_REJECTED: { icon: X => X, color: 'text-red-500' },
  DOCTOR_INVITATION: { icon: HeartPulse, color: 'text-amber-500' },
  SYSTEM: { icon: Bell, color: 'text-muted-foreground' },
  READY_RACING: { icon: Trophy, color: 'text-green-500' },
};

const getMeta = (type: string) => TYPE_META[type] ?? { icon: Bell, color: 'text-muted-foreground' };

const timeAgo = (isoStr: string) => {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const markAllRead = () =>
    setNotifications(ns => ns.map(n => n.status === 'UNREAD' ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() } : n));

  const markRead = (id: number) =>
    setNotifications(ns => ns.map(n => n.id === id && n.status === 'UNREAD' ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() } : n));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications.` : 'All caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {notifications.map(notif => {
              const meta = getMeta(notif.type);
              const IconComp = meta.icon;
              const isUnread = notif.status === 'UNREAD';
              return (
                <div
                  key={notif.id}
                  className={cn('p-4 flex gap-4 transition-colors cursor-pointer hover:bg-muted/30', isUnread ? 'bg-primary/5' : '')}
                  onClick={() => markRead(notif.id)}
                >
                  <div className="mt-1">
                    <div className={`p-2 rounded-full ${isUnread ? 'bg-background shadow-sm' : 'bg-muted'} ${meta.color}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <p className={cn('font-medium text-sm', isUnread ? 'text-foreground' : 'text-muted-foreground')}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                        {isUnread && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <p className={cn('text-sm leading-relaxed', isUnread ? 'text-muted-foreground' : 'text-muted-foreground/70')}>
                      {notif.content}
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-mono">{notif.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
