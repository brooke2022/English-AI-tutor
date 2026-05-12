import { useState } from 'react';
import { Video, Clock, GraduationCap, XCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Status = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  studentName: string;
  type: string;
  time: string;
  status: Status;
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 'b1', studentName: 'Alex Chen', type: 'Trial Lesson', time: '2026-05-13T09:00:00Z', status: 'upcoming' },
  { id: 'b2', studentName: 'Yuki Tanaka', type: 'Regular Lesson', time: '2026-05-14T11:00:00Z', status: 'upcoming' },
  { id: 'b3', studentName: 'Sarah Kim', type: 'IELTS Prep', time: '2026-05-11T10:00:00Z', status: 'upcoming' },
  { id: 'b4', studentName: 'Marco Rossi', type: 'Business English', time: '2026-04-30T14:00:00Z', status: 'completed' },
  { id: 'b5', studentName: 'Liu Wei', type: 'Trial Lesson', time: '2026-04-28T08:00:00Z', status: 'completed' },
  { id: 'b6', studentName: 'Elena Petrova', type: 'Pronunciation', time: '2026-04-25T15:00:00Z', status: 'cancelled' },
];

function formatDateTime(utc: string) {
  const d = new Date(utc);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

const STATUS_STYLES: Record<Status, string> = {
  upcoming: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function TeacherBookings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Status>('upcoming');
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const filtered = bookings.filter((b) => b.status === activeTab);

  const handleCancel = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
    setCancelingId(null);
  };

  const TABS: { label: string; value: Status }[] = [
    { label: t('teacher.bookings.tabUpcoming'), value: 'upcoming' },
    { label: t('teacher.bookings.tabCompleted'), value: 'completed' },
    { label: t('teacher.bookings.tabCancelled'), value: 'cancelled' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('teacher.bookings.title')}</h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {t('teacher.bookings.upcomingCount', { n: bookings.filter((b) => b.status === 'upcoming').length })}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500 text-sm">{t('teacher.bookings.noBookings', { status: activeTab })}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const { date, time } = formatDateTime(booking.time);
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">{booking.studentName[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{booking.studentName}</h3>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${STATUS_STYLES[booking.status]}`}>
                            {booking.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {date} · {time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" /> {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'upcoming' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                          <Video className="w-4 h-4" /> {t('teacher.bookings.join')}
                        </button>
                        <button
                          onClick={() => setCancelingId(booking.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Cancel lesson"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cancel confirmation */}
                  {cancelingId === booking.id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium mb-3">{t('teacher.bookings.cancelConfirm', { name: booking.studentName })}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            {t('teacher.bookings.yesCancel')}
                          </button>
                          <button
                            onClick={() => setCancelingId(null)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            {t('teacher.bookings.keepIt')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
