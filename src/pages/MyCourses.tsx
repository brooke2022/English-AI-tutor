import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, GraduationCap, Video, ExternalLink, X, Copy, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { formatToLocalDate, formatToLocalTime } from '../utils/time';
import { useTeachersStore } from '../store/useTeachersStore';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-600',
};

export default function MyCourses() {
  const { t } = useTranslation();
  const bookedLessons = useStore((state) => state.bookedLessons);
  const teachers = useTeachersStore((s) => s.teachers);
  const [modalLessonId, setModalLessonId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getTeacher = (tutorId: string) => teachers.find((t) => t.id === tutorId);
  const modalLesson = bookedLessons.find((l) => l.id === modalLessonId);
  const modalTeacher = modalLesson ? getTeacher(modalLesson.tutorId) : null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('myCourses.title')}</h1>
          {bookedLessons.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {t('myCourses.upcoming', { n: bookedLessons.filter((l) => l.status === 'pending' || l.status === 'confirmed' || l.status === 'upcoming').length })}
            </span>
          )}
        </div>

        {bookedLessons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('myCourses.noLessons')}</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              {t('myCourses.noLessonsDesc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/teachers"
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                {t('myCourses.browseTutors')}
              </Link>
              <Link
                to="/ai-match"
                className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 font-bold">
                  {t('myCourses.tryAIMatch')}
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookedLessons.map((lesson) => {
              const teacher = getTeacher(lesson.tutorId);
              if (!teacher) return null;

              return (
                <div
                  key={lesson.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {formatToLocalDate(lesson.time).split(',')[0]}
                      </span>
                      <span className="text-lg font-extrabold text-blue-900">
                        {formatToLocalDate(lesson.time).split(' ')[2]}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md shrink-0">
                          {lesson.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize shrink-0 ${STATUS_BADGE[lesson.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {t(`myCourses.status.${lesson.status}`, { defaultValue: lesson.status })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatToLocalTime(lesson.time)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4" />
                          {teacher.tags[0]}
                        </span>
                      </div>
                      {lesson.status === 'pending' && (
                        <p className="mt-1 text-xs text-amber-600">{t('myCourses.awaitingConfirmation')}</p>
                      )}
                      {lesson.status === 'cancelled' && lesson.rejectionReason && (
                        <p className="mt-1 text-xs text-red-500">
                          {t('myCourses.rejectedReason')}: {lesson.rejectionReason.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lesson.status === 'confirmed' && lesson.meetingUrl && (
                      <button
                        onClick={() => { setModalLessonId(lesson.id); setCopied(false); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                      >
                        <Video className="w-4 h-4" />
                        {t('myCourses.enterClassroom')}
                      </button>
                    )}
                    <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Meeting link modal */}
      {modalLessonId && modalLesson && modalTeacher && (
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

            <p className="text-sm text-gray-500 mb-1">{modalTeacher.name} · {formatToLocalDate(modalLesson.time)} {formatToLocalTime(modalLesson.time)}</p>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 break-all text-sm text-blue-700 font-mono">
              {modalLesson.meetingUrl}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleCopy(modalLesson.meetingUrl!)}
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
