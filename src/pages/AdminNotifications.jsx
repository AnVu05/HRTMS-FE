import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

const mapNotificationAppearance = (notif) => {
  const typeStr = (notif.type || '').toLowerCase();
  const titleStr = (notif.title || '').toLowerCase();

  let colorClass = 'primary';
  let icon = 'info';

  if (typeStr.includes('error') || titleStr.includes('reject') || titleStr.includes('fail')) {
    colorClass = 'error';
    icon = 'error';
  } else if (typeStr.includes('success') || titleStr.includes('accept') || titleStr.includes('approve') || titleStr.includes('verif')) {
    colorClass = 'success';
    icon = titleStr.includes('verif') ? 'verified' : 'check_circle';
  }

  return { colorClass, icon };
};

export default function AdminNotifications({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Assuming adminId is 1 for now (or get from context)
  const ADMIN_ID = 2;

  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const res = await notificationService.getAdminNotifications(ADMIN_ID, currentPage, 5, unreadOnly);

      const content = res?.data?.content || [];
      const isLast = res?.data?.last ?? true;

      setNotifications(prev => reset ? content : [...prev, ...content]);
      setHasMore(!isLast);
      if (!reset) setPage(currentPage + 1);
      else setPage(1);

    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    fetchNotifications(true);
  }, [unreadOnly]); // Re-fetch when filter changes

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(ADMIN_ID);
      // Refresh the current view
      fetchNotifications(true);
    } catch (error) {
      console.error('Failed to mark all as read', error);
      alert('Failed to mark notifications as read');
    }
  };

  const getColorClasses = (type) => {
    switch (type) {
      case 'success': return { bar: 'bg-success', iconBg: 'bg-success/10', iconText: 'text-success' };
      case 'primary': return { bar: 'bg-primary', iconBg: 'bg-primary/10', iconText: 'text-primary' };
      case 'error': return { bar: 'bg-error', iconBg: 'bg-error/10', iconText: 'text-error' };
      default: return { bar: 'bg-surface-variant', iconBg: 'bg-surface-variant/10', iconText: 'text-on-surface-variant' };
    }
  };

  return (
    <div className="flex min-h-screen text-on-surface bg-background overflow-x-hidden w-full font-sans">
      {/* Shared Sidebar */}
      <aside className={`w-72 bg-white border-r border-outline-variant flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined">house</span>
          </div>
          <div>
            <h1 className="text-on-surface font-bold text-sm tracking-tight m-0">Admin Panel</h1>
            <p className="text-on-surface-variant text-xs m-0">Premium Equine Management</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-decoration-none" href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin-dashboard'); }}>
            <span className="material-symbols-outlined">emoji_events</span>
            <span className="text-sm font-medium">Tournament management</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">how_to_reg</span>
            <span className="text-sm font-medium">Approve application</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">verified_user</span>
            <span className="text-sm font-medium">Verify profile Jockey</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">health_and_safety</span>
            <span className="text-sm font-medium">Healthcheck management</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined">report_problem</span>
            <span className="text-sm font-medium">Incident management</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed transition-colors text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            <span className="text-sm font-medium">Notification</span>
          </a>
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-error hover:bg-error/10 transition-colors border-0 bg-transparent" onClick={() => onNavigate('login')}>
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full">
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b border-outline-variant flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <button className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors border-0 bg-transparent" onClick={() => setMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-6"></div>
          <div className="flex items-center gap-4"></div>
        </header>

        {/* Page Header */}
        <section className="max-w-[1320px] mx-auto w-full p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">System Notifications</h2>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-highest text-on-surface font-bold text-sm rounded-lg hover:bg-surface-dim transition-all shadow-sm w-full md:w-fit justify-center border-0"
              onClick={handleMarkAllAsRead}
            >
              <span className="material-symbols-outlined text-lg">check_small</span>
              Mark all as read
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-1 bg-surface-container rounded-xl w-fit mb-8 border border-outline-variant">
            <button
              className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm border-0 transition-all ${!unreadOnly ? 'bg-white text-primary' : 'bg-transparent text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setUnreadOnly(false)}
            >
              All Alerts
            </button>
            <button
              className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm border-0 transition-all ${unreadOnly ? 'bg-white text-primary' : 'bg-transparent text-on-surface-variant hover:bg-white/50'}`}
              onClick={() => setUnreadOnly(true)}
            >
              Unread
            </button>
          </div>

          {/* Notification List */}
          <div className="flex flex-col gap-4">
            {notifications.length === 0 && !loading && (
              <div className="text-center py-12 text-on-surface-variant bg-white border border-outline-variant rounded-2xl">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                <p>No notifications found.</p>
              </div>
            )}

            {notifications.map((notif) => {
              const { colorClass, icon } = mapNotificationAppearance(notif);
              const colors = getColorClasses(colorClass);
              // Slight dimming for read notifications
              const isUnread = !notif.readAt;
              const opacityClass = isUnread ? '' : 'opacity-70';

              return (
                <div key={notif.id} className={`group bg-white border border-outline-variant p-5 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all flex items-start gap-5 relative overflow-hidden md:gap-6 ${opacityClass}`}>
                  {isUnread && <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar}`}></div>}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg} ${colors.iconText}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                      <h3 className={`text-base font-bold text-on-surface m-0 ${isUnread ? '' : 'font-medium'}`}>{notif.title}</h3>
                      <span className="text-xs text-on-surface-variant font-medium">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-0 mt-1">
                      {notif.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-12 flex justify-center pb-24">
              <button
                className="px-8 py-3 border border-outline-variant text-on-surface-variant font-bold text-sm rounded-xl hover:bg-white hover:shadow-sm transition-all bg-transparent"
                onClick={() => fetchNotifications(false)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'View More Notification'}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
