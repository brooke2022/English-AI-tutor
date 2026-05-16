import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TeacherCard from '../components/TeacherCard';
import { useTeachers } from '../hooks/useTeachers';

export default function Home() {
  const { t } = useTranslation();
  const { data: allTeachers = [] } = useTeachers();
  const featuredTeachers = allTeachers.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>{t('home.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            {t('home.heroTitle')} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              {t('home.heroHighlight')}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/teachers"
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('home.findTutor')}
            </Link>
            <Link
              to="/ai-match"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-semibold text-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              {t('home.tryAIMatch')}
            </Link>
          </div>

          {/* Trust Bar */}
          <div className="mt-20 pt-10 border-t border-gray-200/60 flex flex-wrap justify-center gap-12 opacity-80">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-gray-400" />
              <div className="text-left">
                <div className="font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-500">{t('home.stats.tutors')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-gray-400" />
              <div className="text-left">
                <div className="font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-500">{t('home.stats.students')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gray-400" />
              <div className="text-left">
                <div className="font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-500">{t('home.stats.availability')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teachers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.featuredTitle')}</h2>
              <p className="text-gray-600">{t('home.featuredSubtitle')}</p>
            </div>
            <Link to="/teachers" className="hidden sm:block text-blue-600 font-medium hover:text-blue-700">
              {t('home.viewAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTeachers.map((teacher) => (
              <React.Fragment key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </React.Fragment>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/teachers" className="text-blue-600 font-medium hover:text-blue-700">
              {t('home.viewAll')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
