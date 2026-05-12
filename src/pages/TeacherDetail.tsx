import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Video, Clock, Globe, Calendar as CalendarIcon, CheckCircle2, GraduationCap, Award, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatToLocalTime, formatToLocalDate, groupSlotsByDay, getUserTimezone } from '../utils/time';
import { useTeachersStore } from '../store/useTeachersStore';

export default function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addLesson = useStore((state) => state.addLesson);
  const { user } = useAuthStore();
  const updateTeacher = useTeachersStore((s) => s.updateTeacher);

  const teacher = useTeachersStore((s) => s.teachers.find((t) => t.id === id && t.status === 'approved'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const groupedSlots = teacher ? groupSlotsByDay(teacher.availableSlots) : {};
  const days = Object.keys(groupedSlots);
  const [selectedDay, setSelectedDay] = useState(days[0] ?? '');

  if (!teacher) {
    return <div className="p-12 text-center text-gray-500">Teacher not found</div>;
  }

  const handleBook = () => {
    if (!selectedSlot) return;

    setIsBooking(true);

    setTimeout(() => {
      addLesson({
        id: `lesson-${Date.now()}`,
        tutorId: teacher.id,
        studentId: user?.id ?? 'guest',
        studentName: user?.name ?? 'Student',
        time: selectedSlot,
        type: 'Trial Lesson',
        status: 'pending',
      });

      updateTeacher(teacher.id, {
        availableSlots: teacher.availableSlots.filter((s) => s !== selectedSlot),
      });

      setIsBooking(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/my-courses');
      }, 4000);
    }, 800);
  };

  const isYouTube = teacher.videoUrl && (teacher.videoUrl.includes('youtube.com') || teacher.videoUrl.includes('youtu.be'));

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Profile & Video */}
        <div className="lg:col-span-2 space-y-8">

          {/* Video */}
          <div className="bg-gray-900 rounded-2xl aspect-video relative overflow-hidden shadow-lg">
            {isYouTube ? (
              <iframe
                src={teacher.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                title={`${teacher.name} intro video`}
              />
            ) : teacher.videoUrl ? (
              <video src={teacher.videoUrl} controls className="w-full h-full object-cover" />
            ) : (
              <>
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" /> {teacher.country}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="w-4 h-4 fill-current" /> {teacher.rating} ({teacher.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${teacher.price}</div>
                <div className="text-sm text-gray-500">{t('teacherDetail.perHour')}</div>
              </div>
            </div>

            {(teacher.yearsExp || teacher.education) && (
              <div className="flex flex-wrap gap-4 mb-6">
                {teacher.yearsExp && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl text-sm text-blue-700 font-medium">
                    <Award className="w-4 h-4" />
                    {t('teacherDetail.yearsExp', { n: teacher.yearsExp })}
                  </div>
                )}
                {teacher.education && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-xl text-sm text-violet-700 font-medium">
                    <GraduationCap className="w-4 h-4" />
                    {teacher.education}
                  </div>
                )}
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('teacherDetail.aboutMe')}</h2>
            <p className="text-gray-600 leading-relaxed mb-8">{teacher.intro}</p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('teacherDetail.specialties')}</h2>
            <div className="flex flex-wrap gap-2">
              {teacher.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded-lg text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('teacherDetail.reviews')}</h2>
            <div className="space-y-6">
              {teacher.reviews?.map(review => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{review.studentName}</span>
                    <span className="text-sm text-gray-500">{formatToLocalDate(review.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {t('teacherDetail.bookLesson')}
            </h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-start gap-2 text-sm text-gray-600 border border-gray-100">
              <Clock className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
              <p>
                {t('teacherDetail.timesShownIn')}<br/>
                <strong className="text-gray-900">{getUserTimezone()}</strong>
              </p>
            </div>

            {/* Day Selector */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedDay === day
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {groupedSlots[selectedDay]?.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? 'bg-blue-50 border-2 border-blue-600 text-blue-700'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  {formatToLocalTime(slot)}
                </button>
              ))}
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedSlot || isBooking}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg transition-colors shadow-md disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isBooking ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('teacherDetail.bookFor', { price: teacher.trialPrice || teacher.price })
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('teacherDetail.lessonBooked')}</h3>
            <p className="text-gray-600 mb-4">
              {t('teacherDetail.lessonPendingMsg', { name: teacher.name })}
            </p>
            {teacher.whatsapp && (
              <a
                href={`https://wa.me/${teacher.whatsapp}?text=${encodeURIComponent(
                  `Hi ${teacher.name}! 🎉 A student just booked a lesson with you.\nTime: ${formatToLocalDate(selectedSlot!)} ${formatToLocalTime(selectedSlot!)}\nPlease check your TutorAI dashboard to confirm.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors mb-4"
              >
                <MessageCircle className="w-4 h-4" />
                {t('teacherDetail.notifyWhatsApp')}
              </a>
            )}
            <div className="text-sm text-gray-400">{t('teacherDetail.redirecting')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
