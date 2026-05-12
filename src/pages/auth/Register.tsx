import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">TutorAI</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t('auth.register.title')}</h1>
          <p className="text-gray-500 mb-8 text-center text-sm">{t('auth.register.subtitle')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              to="/register/student"
              className="group flex flex-col items-center gap-4 p-6 border-2 border-gray-200 hover:border-blue-500 rounded-2xl transition-all hover:shadow-md"
            >
              <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">{t('auth.register.student')}</h3>
                <p className="text-sm text-gray-500">{t('auth.register.studentSub')}</p>
              </div>
            </Link>

            <Link
              to="/register/teacher"
              className="group flex flex-col items-center gap-4 p-6 border-2 border-gray-200 hover:border-violet-500 rounded-2xl transition-all hover:shadow-md"
            >
              <div className="w-14 h-14 bg-violet-50 group-hover:bg-violet-100 rounded-2xl flex items-center justify-center transition-colors">
                <GraduationCap className="w-7 h-7 text-violet-600" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-1">{t('auth.register.teacher')}</h3>
                <p className="text-sm text-gray-500">{t('auth.register.teacherSub')}</p>
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500">
            {t('auth.register.alreadyHave')}{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">{t('auth.register.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
