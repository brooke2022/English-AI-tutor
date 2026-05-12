import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, Sparkles, BookOpen, ChevronRight, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore } from '../../store/useStore';
import { formatToLocalDate, formatToLocalTime } from '../../utils/time';
import teachersData from '../../data/teachers.json';
import { Teacher } from '../../types';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { bookedLessons } = useStore();
  const { t } = useTranslation();
  const teachers = teachersData as Teacher[];

  const getTeacher = (tutorId: string) => teachers.find((t) => t.id === tutorId);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('common.goodMorning') : hour < 17 ? t('common.goodAfternoon') : t('common.goodEvening');

  const upcomingLessons = bookedLessons.filter((l) => l.status === 'upcoming');
  const recentLessons = upcomingLessons.slice(0, 3);

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
            <div className="text-3xl font-bold text-gray-900">{upcomingLessons.length}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">{t('student.dashboard.totalHours')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
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
                  const teacher = getTeacher(lesson.tutorId);
                  if (!teacher) return null;
                  return (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{teacher.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatToLocalDate(lesson.time)} · {formatToLocalTime(lesson.time)}
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                        {t('student.dashboard.join')}
                      </button>
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
    </div>
  );
}
