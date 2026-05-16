import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, Sparkles, BookOpen, ChevronRight, User, Video, ExternalLink, X, Copy, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { formatToLocalDate, formatToLocalTime } from '../../utils/time';
import { useBookings } from '../../hooks/useBookings';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { data: bookings = [] } = useBookings();
  const [modalLessonId, setModalLessonId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const modalLesson = bookings.find((l) => l.id === modalLessonId);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('common.goodMorning') : hour < 17 ? t('common.goodAfternoon') : t('common.goodEvening');

  const activeLessons = bookings.filter((l) => l.status === 'PENDING' || l.status === 'CONFIRMED');
  const recentLessons = activeLessons.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{t('student.dashboard.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">{t('student.dashboard.upcomingLessons')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{activeLessons.length}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">{t('student.dashboard.totalHours')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">{t('student.dashboard.favoriteTutors')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('student.dashboard.upcomingLessons')}</h2>
              <Link to="/student/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('student.dashboard.viewAll')}
              </Link>
            </div>

            {recentLessons.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-gray-500 text-sm mb-4">{t('student.dashboard.noLessons')}</p>
                <Link
                  to="/teachers"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  {t('student.dashboard.browseTutors')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLessons.map((lesson) => {
                  const teacherName = lesson.teacherProfile.user.name;
                  const teacherAvatar = lesson.teacherProfile.user.avatarUrl;
                  return (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {teacherAvatar ? (
                          <img
                            src={teacherAvatar}
                            alt={teacherName}
                            className="w-12 h-12 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold">
                            {teacherName[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-gray-900">{teacherName}</p>
                            {lesson.status === 'PENDING' && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                                {t('myCourses.status.pending', { defaultValue: 'Pending' })}
                              </span>
                            )}
                            {lesson.status === 'CONFIRMED' && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                {t('myCourses.status.confirmed', { defaultValue: 'Confirmed' })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatToLocalDate(lesson.slotTime)} · {formatToLocalTime(lesson.slotTime)}
                          </p>
                          {lesson.status === 'PENDING' && (
                            <p className="text-xs text-amber-600 mt-0.5">{t('myCourses.pendingApproval')}</p>
                          )}
                        </div>
                      </div>
                      {lesson.status === 'CONFIRMED' && lesson.meetingUrl && (
                        <button
                          onClick={() => { setModalLessonId(lesson.id); setCopied(false); }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <Video className="w-4 h-4" />
                          {t('myCourses.enterClassroom')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{t('student.dashboard.quickActions')}</h2>

            {[
              { to: '/teachers', icon: <BookOpen className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: t('student.dashboard.findTutor'), sub: t('student.dashboard.findTutorSub') },
              { to: '/ai-match', icon: <Sparkles className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50', title: t('student.dashboard.aiMatch'), sub: t('student.dashboard.aiMatchSub') },
              { to: '/student/profile', icon: <User className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-100', title: t('student.dashboard.myProfile'), sub: t('student.dashboard.myProfileSub') },
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

      {modalLessonId && modalLesson && modalLesson.meetingUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setModalLessonId(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">{t('myCourses.classroomLink')}</h3>
              <button
                onClick={() => setModalLessonId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-1">
              {formatToLocalDate(modalLesson.slotTime)} {formatToLocalTime(modalLesson.slotTime)}
            </p>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 break-all text-sm text-blue-700 font-mono">
              {modalLesson.meetingUrl}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { navigator.clipboard.writeText(modalLesson.meetingUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-xl transition-colors"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? t('myCourses.copied') : t('myCourses.copyLink')}
              </button>
              <a
                href={modalLesson.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('myCourses.openLink')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
