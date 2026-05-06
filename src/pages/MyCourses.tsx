import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, ChevronRight, GraduationCap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatToLocalDate, formatToLocalTime } from '../utils/time';
import teachersData from '../data/teachers.json';
import { Teacher } from '../types';

export default function MyCourses() {
  const bookedLessons = useStore((state) => state.bookedLessons);
  const teachers = teachersData as Teacher[];

  // Helper to get teacher details for a lesson
  const getTeacher = (tutorId: string) => teachers.find((t) => t.id === tutorId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          {bookedLessons.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {bookedLessons.length} Upcoming
            </span>
          )}
        </div>

        {bookedLessons.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No upcoming lessons yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              Ready to start your English journey? Find the perfect tutor or let our AI match you with the best fit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/teachers"
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                Browse Tutors
              </Link>
              <Link
                to="/ai-match"
                className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 font-bold">
                  Try AI Match
                </span>
              </Link>
            </div>
          </div>
        ) : (
          /* Lesson List */
          <div className="space-y-4">
            {bookedLessons.map((lesson) => {
              const teacher = getTeacher(lesson.tutorId);
              if (!teacher) return null;

              return (
                <div
                  key={lesson.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-5">
                    {/* Date/Time Block */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {formatToLocalDate(lesson.time).split(',')[0]}
                      </span>
                      <span className="text-lg font-extrabold text-blue-900">
                        {formatToLocalDate(lesson.time).split(' ')[2]}
                      </span>
                    </div>

                    {/* Lesson Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md">
                          {lesson.type}
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
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full sm:w-auto flex items-center gap-3 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" />
                      Join Lesson
                    </button>
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
    </div>
  );
}
