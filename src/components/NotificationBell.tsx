import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkRead, useMarkAllRead, Notification } from '../hooks/useNotifications';

function formatNotification(n: Notification): string {
  const p = n.payload as Record<string, string>;
  switch (n.type) {
    case 'BOOKING_CREATED':
      return `New booking from ${p.studentName ?? 'a student'}`;
    case 'BOOKING_CONFIRMED':
      return `Your lesson with ${p.teacherName ?? 'your teacher'} is confirmed`;
    case 'BOOKING_CANCELLED':
      return `A booking was cancelled${p.reason ? ': ' + p.reason : ''}`;
    case 'LESSON_REMINDER':
      return `Lesson starts in ${p.minutesBefore} min`;
    default:
      return n.type;
  }
}

export default function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.readAt && markRead.mutate(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                    !n.readAt ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-900">{formatNotification(n)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
