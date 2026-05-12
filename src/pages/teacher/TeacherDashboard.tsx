import { Link } from 'react-router-dom';
import { Calendar, Users, Star, DollarSign, Video, ChevronRight, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useTeachersStore } from '../../store/useTeachersStore';
import { useStore } from '../../store/useStore';
import { formatToLocalTime } from '../../utils/time';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { bookedLessons } = useStore();

  const teacherListing = useTeachersStore((s) => user ? s.getTeacherByUserId(user.id) : undefined);
  const profileStatus = teacherListing?.status;

  const myBookings = teacherListing
    ? bookedLessons.filter((l) => l.tutorId === teacherListing.id)
    : [];

  const pendingBookings = myBookings.filter((l) => l.status === 'pending');
  const todayBookings = myBookings.filter((l) => {
    const today = new Date().toDateString();
    return (l.status === 'confirmed' || l.status === 'upcoming')
      && new Date(l.time).toDateString() === today;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('common.goodMorning') : hour < 17 ? t('common.goodAfternoon') : t('common.goodEvening');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Status Banner */}
        {profileStatus === 'pending' && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-800">
            <Info className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-sm">{t('teacher.dashboard.pendingMsg')}</p>
              <p className="text-sm mt-0.5 text-amber-700">{t('teacher.dashboard.pendingDetail')}</p>
            </div>
          </div>
        )}
        {profileStatus === 'rejected' && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-800">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-sm">{t('teacher.dashboard.rejectedMsg')}</p>
              <p className="text-sm mt-0.5 text-red-700">{t('teacher.dashboard.rejectedDetail')}</p>
            </div>
          </div>
        )}
        {profileStatus === 'approved' && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-emerald-700 w-fit">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">{t('teacher.dashboard.profileLive')}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('teacher.dashboard.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: t('teacher.dashboard.upcoming'), value: String(myBookings.filter(l => l.status === 'confirmed' || l.status === 'upcoming').length), icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50' },
            { label: t('teacher.dashboard.totalStudents'), value: String(new Set(myBookings.map(l => l.studentId)).size), icon: <Users className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: t('teacher.dashboard.avgRating'), value: teacherListing ? `${teacherListing.rating} ★` : '—', icon: <Star className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50' },
            { label: t('teacher.dashboard.monthlyEarnings'), value: teacherListing ? `$${teacherListing.price * myBookings.filter(l => l.status === 'completed').length}` : '$0', icon: <DollarSign className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50' },
          ].map(({ label, value, icon, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Booking Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{t('teacher.dashboard.bookingRequests')}</h2>
                <Link to="/teacher/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">{t('teacher.dashboard.viewAll')}</Link>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <p className="text-gray-500 text-sm">{t('teacher.dashboard.noPending')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{b.studentName[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{b.studentName}</p>
                          <p className="text-xs text-gray-500">{b.type} · {formatToLocalTime(b.time)}</p>
                        </div>
                      </div>
                      <Link
                        to="/teacher/bookings"
                        className="flex items-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        {t('teacher.bookings.tabPending')} →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Schedule */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t('teacher.dashboard.todaySchedule')}</h2>
              {todayBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <p className="text-gray-500 text-sm">{t('teacher.dashboard.noLessons')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map((lesson) => (
                    <div key={lesson.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
                          <Clock className="w-4 h-4 text-blue-500 mb-0.5" />
                          <span className="text-xs font-bold text-blue-700">{formatToLocalTime(lesson.time)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{lesson.studentName}</p>
                          <p className="text-xs text-gray-500">{lesson.type}</p>
                        </div>
                      </div>
                      {lesson.meetingUrl ? (
                        <a
                          href={lesson.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                          <Video className="w-4 h-4" /> {t('teacher.dashboard.join')}
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-xl">
                          <Video className="w-4 h-4" /> {t('teacher.dashboard.join')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{t('teacher.dashboard.quickActions')}</h2>
            {[
              { to: '/teacher/profile', icon: <Star className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50', title: t('teacher.dashboard.myProfile'), sub: t('teacher.dashboard.myProfileSub') },
              { to: '/teacher/availability', icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: t('teacher.dashboard.setAvailability'), sub: t('teacher.dashboard.setAvailabilitySub') },
              { to: '/teacher/bookings', icon: <Users className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', title: t('teacher.dashboard.allBookings'), sub: t('teacher.dashboard.allBookingsSub') },
            ].map(({ to, icon, bg, title, sub }) => (
              <Link
                key={to}
                to={to}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
