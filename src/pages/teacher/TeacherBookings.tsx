import { useState } from 'react';
import { Video, Clock, GraduationCap, XCircle, AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatToLocalDate, formatToLocalTime } from '../../utils/time';
import {
  useBookings,
  useAcceptBooking,
  useRejectBooking,
  BookingDto,
} from '../../hooks/useBookings';

type TabStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const REJECTION_REASONS = [
  { value: 'schedule_conflict', en: 'Schedule conflict (临时有事)' },
  { value: 'student_mismatch', en: 'Student mismatch (学生不匹配)' },
  { value: 'other', en: 'Other (其他)' },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function TeacherBookings() {
  const { t } = useTranslation();
  const { data: bookings = [], isLoading } = useBookings();
  const acceptMut = useAcceptBooking();
  const rejectMut = useRejectBooking();

  const [activeTab, setActiveTab] = useState<TabStatus>('PENDING');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingUrlError, setMeetingUrlError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0].value);

  const filtered = bookings.filter((b) => b.status === activeTab);

  const TABS: { label: string; value: TabStatus }[] = [
    { label: t('teacher.bookings.tabPending'), value: 'PENDING' },
    { label: t('teacher.bookings.tabConfirmed'), value: 'CONFIRMED' },
    { label: t('teacher.bookings.tabCompleted'), value: 'COMPLETED' },
    { label: t('teacher.bookings.tabCancelled'), value: 'CANCELLED' },
  ];

  const handleAccept = async (booking: BookingDto) => {
    if (!meetingUrl.trim()) {
      setMeetingUrlError(t('teacher.bookings.meetingUrlRequired'));
      return;
    }
    try {
      await acceptMut.mutateAsync({ id: booking.id, meetingUrl: meetingUrl.trim() });
      setAcceptingId(null);
      setMeetingUrl('');
      setMeetingUrlError(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to accept booking';
      setMeetingUrlError(msg);
    }
  };

  const handleReject = async (booking: BookingDto) => {
    try {
      await rejectMut.mutateAsync({ id: booking.id, reason: rejectReason });
      setRejectingId(null);
      setRejectReason(REJECTION_REASONS[0].value);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('teacher.bookings.title')}</h1>
          <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
            {t('teacher.bookings.pendingCount', { n: pendingCount })}
          </span>
        </div>

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

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500 text-sm">{t('teacher.bookings.noBookings', { status: activeTab.toLowerCase() })}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">{booking.student.name[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{booking.student.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${STATUS_STYLES[booking.status]}`}>
                          {booking.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatToLocalDate(booking.slotTime)} · {formatToLocalTime(booking.slotTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" /> {booking.status.toLowerCase()}
                        </span>
                      </div>
                      {booking.meetingUrl && (
                        <a
                          href={booking.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline break-all"
                        >
                          <LinkIcon className="w-3 h-3" /> {booking.meetingUrl}
                        </a>
                      )}
                    </div>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setAcceptingId(booking.id); setRejectingId(null); setMeetingUrl(''); setMeetingUrlError(null); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {t('teacher.bookings.accept')}
                      </button>
                      <button
                        onClick={() => { setRejectingId(booking.id); setAcceptingId(null); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Decline"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {booking.status === 'CONFIRMED' && booking.meetingUrl && (
                    <a
                      href={booking.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
                    >
                      <Video className="w-4 h-4" /> {t('teacher.bookings.join')}
                    </a>
                  )}
                </div>

                {acceptingId === booking.id && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-800 mb-3">
                      {t('teacher.bookings.meetingUrlLabel')}
                    </p>
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => { setMeetingUrl(e.target.value); setMeetingUrlError(null); }}
                      placeholder={t('teacher.bookings.meetingUrlPlaceholder')}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm mb-1 outline-none focus:ring-2 focus:ring-emerald-400 ${
                        meetingUrlError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    />
                    {meetingUrlError && (
                      <p className="text-xs text-red-600 mb-3">{meetingUrlError}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(booking)}
                        disabled={acceptMut.isPending}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        {t('teacher.bookings.confirmAccept')}
                      </button>
                      <button
                        onClick={() => { setAcceptingId(null); setMeetingUrl(''); setMeetingUrlError(null); }}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        {t('teacher.bookings.keepIt')}
                      </button>
                    </div>
                  </div>
                )}

                {rejectingId === booking.id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium mb-3">
                          {t('teacher.bookings.rejectReasonLabel')}
                        </p>
                        <div className="space-y-2 mb-4">
                          {REJECTION_REASONS.map((r) => (
                            <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reject-${booking.id}`}
                                value={r.value}
                                checked={rejectReason === r.value}
                                onChange={() => setRejectReason(r.value)}
                                className="accent-red-600"
                              />
                              <span className="text-sm text-gray-700">{r.en}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(booking)}
                            disabled={rejectMut.isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            {t('teacher.bookings.confirmDecline')}
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            {t('teacher.bookings.keepIt')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
