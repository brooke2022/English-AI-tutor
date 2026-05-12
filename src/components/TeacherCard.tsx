import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Teacher } from '../types';

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function TeacherCard({ teacher }: { teacher: Teacher }) {
  const { t } = useTranslation();
  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={teacher.avatar}
          alt={teacher.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {teacher.trialPrice && (
          <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <span>{t('teacherCard.trial', { price: teacher.trialPrice })}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            {teacher.name}
            <span title={teacher.country} className="text-base">
              {getFlagEmoji(teacher.countryCode)}
            </span>
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{teacher.rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal text-xs">({teacher.reviewCount})</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
          {teacher.intro}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {teacher.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
              {t('teacherCard.hourlyRate')}
            </span>
            <span className="text-lg font-bold text-gray-900">
              ${teacher.price}
            </span>
          </div>
          <Link
            to={`/teachers/${teacher.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            {t('teacherCard.viewProfile')}
          </Link>
        </div>
      </div>
    </div>
  );
}
