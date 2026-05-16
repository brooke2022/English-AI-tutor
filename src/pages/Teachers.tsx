import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TeacherCard from '../components/TeacherCard';
import { useTeachers } from '../hooks/useTeachers';

const TAGS = ['All', 'IELTS', 'Business', 'Kids', 'Conversational', 'Beginners', 'Job Interview'];

export default function Teachers() {
  const { t } = useTranslation();
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalTime, setShowLocalTime] = useState(true);

  const { data: teachers = [], isLoading } = useTeachers();

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesTag = activeTag === 'All' || teacher.tags.includes(activeTag);
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teacher.intro.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('teachers.searchPlaceholder')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>{t('teachers.showTimesIn')}</span>
              <button
                onClick={() => setShowLocalTime(!showLocalTime)}
                className="font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
              >
                {showLocalTime ? t('teachers.localTime') : t('teachers.tutorTime')}
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 mt-4 pb-2 scrollbar-hide">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {isLoading ? (
          <div className="text-center py-24 text-gray-500">Loading...</div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <React.Fragment key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('teachers.noResults')}</h3>
            <p className="text-gray-500">{t('teachers.noResultsSub')}</p>
            <button
              onClick={() => { setActiveTag('All'); setSearchQuery(''); }}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              {t('teachers.clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
