import { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import TeacherCard from '../components/TeacherCard';
import teachersData from '../data/teachers.json';
import { Teacher } from '../types';

const TAGS = ['All', 'IELTS', 'Business', 'Kids', 'Conversational', 'Beginners', 'Job Interview'];

export default function Teachers() {
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalTime, setShowLocalTime] = useState(true);

  const teachers = teachersData as Teacher[];

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
            
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or keyword..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Timezone Toggle */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>Show times in:</span>
              <button
                onClick={() => setShowLocalTime(!showLocalTime)}
                className="font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
              >
                {showLocalTime ? 'Local Time' : 'Tutor Time'}
              </button>
            </div>
          </div>

          {/* Tags */}
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
        {filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setActiveTag('All'); setSearchQuery(''); }}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
