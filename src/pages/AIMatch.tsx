import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TeacherCard from '../components/TeacherCard';
import { useTeachersStore } from '../store/useTeachersStore';
import { TeacherListing } from '../types';

const CHIPS = ['IELTS Speaking', 'Job Interview', 'Business English', 'Kids Beginner'];

export default function AIMatch() {
  const { t } = useTranslation();
  const allTeachers = useTeachersStore((s) => s.teachers);
  const approved = allTeachers.filter((t) => t.status === 'approved');
  const [query, setQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');
  const [results, setResults] = useState<TeacherListing[] | null>(null);

  const handleMatch = () => {
    if (!query.trim()) return;

    setIsMatching(true);
    setResults(null);
    setMatchStatus(t('aiMatch.analyzing'));

    setTimeout(() => {
      setMatchStatus(t('aiMatch.filtering'));
    }, 1000);

    setTimeout(() => {
      setMatchStatus(t('aiMatch.foundBest'));
    }, 2000);

    setTimeout(() => {
      setIsMatching(false);
      setResults(approved.slice(0, 2));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            {t('aiMatch.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('aiMatch.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('aiMatch.placeholder')}
            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 mb-4"
            disabled={isMatching}
          />

          <div className="flex flex-wrap gap-2 mb-6">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setQuery(chip)}
                disabled={isMatching}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            onClick={handleMatch}
            disabled={isMatching || !query.trim()}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            {isMatching ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {isMatching ? t('aiMatch.matching') : t('aiMatch.findMyTutor')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isMatching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <motion.div
                key={matchStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"
              >
                {matchStatus}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !isMatching && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold mb-8">
                <CheckCircle2 className="w-6 h-6" />
                <span>{t('aiMatch.foundMatches')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                      {98 - index * 3}% Match
                    </div>
                    <TeacherCard teacher={teacher} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
