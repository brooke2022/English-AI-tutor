import { useEffect, useState } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useTeacher, useSetAvailability } from '../../hooks/useTeachers';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7AM–8PM
// Maps display day → backend dayOfWeek (0=Sun..6=Sat per JS getUTCDay)
const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

type SlotStatus = 'available' | 'booked';
type Slots = Record<string, SlotStatus>;

function slotKey(day: string, hour: number) {
  return `${day}-${hour}`;
}

export default function TeacherAvailability() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { data: teacher } = useTeacher(user?.id);
  const setAvailMut = useSetAvailability();

  const [slots, setSlots] = useState<Slots>({});
  const [saved, setSaved] = useState(false);

  // Load current weeklySlots ("1-9" format = dayOfWeek-hour) into UI keys (e.g. "Mon-9")
  useEffect(() => {
    if (!teacher?.weeklySlots) return;
    const initial: Slots = {};
    for (const key of teacher.weeklySlots) {
      const [dowStr, hourStr] = key.split('-');
      const dow = parseInt(dowStr, 10);
      const dayName = Object.entries(DAY_INDEX).find(([, v]) => v === dow)?.[0];
      if (dayName) initial[slotKey(dayName, parseInt(hourStr, 10))] = 'available';
    }
    setSlots(initial);
  }, [teacher?.weeklySlots]);

  const toggle = (day: string, hour: number) => {
    const key = slotKey(day, hour);
    if (slots[key] === 'booked') return;
    setSlots((s) => {
      const next = { ...s };
      if (next[key] === 'available') delete next[key];
      else next[key] = 'available';
      return next;
    });
  };

  const handleSave = async () => {
    const slotsPayload = Object.entries(slots)
      .filter(([, v]) => v === 'available')
      .map(([k]) => {
        const [dayStr, hourStr] = k.split('-');
        return { dayOfWeek: DAY_INDEX[dayStr], hour: parseInt(hourStr, 10) };
      });
    try {
      await setAvailMut.mutateAsync(slotsPayload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const copyLastWeek = () => {
    setSlots((s) => {
      const copy: Slots = {};
      Object.entries(s).forEach(([k, v]) => { copy[k] = v as SlotStatus; });
      return copy;
    });
  };

  const clearAll = () => {
    setSlots((s) => {
      const next: Slots = {};
      Object.entries(s).forEach(([k, v]) => { if (v === 'booked') next[k] = 'booked'; });
      return next;
    });
  };

  const availableCount = Object.values(slots).filter((v) => v === 'available').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('teacher.availability.title')}</h1>
            <p className="text-gray-500 mt-1 text-sm">{t('teacher.availability.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl transition-colors"
            >
              {t('teacher.availability.clearAll')}
            </button>
            <button
              onClick={copyLastWeek}
              className="text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl transition-colors"
            >
              {t('teacher.availability.copySchedule')}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> {t('teacher.availability.saved')}</> : t('teacher.availability.save')}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300" />
            <span className="text-gray-600">{t('teacher.availability.available', { n: availableCount })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
            <span className="text-gray-600">{t('teacher.availability.booked')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
            <span className="text-gray-600">{t('teacher.availability.unavailable')}</span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="py-4 px-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 px-4 text-xs text-gray-400 font-medium whitespace-nowrap">
                    {hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`}
                  </td>
                  {DAYS.map((day) => {
                    const key = slotKey(day, hour);
                    const status = slots[key];
                    return (
                      <td key={day} className="py-2 px-2 text-center">
                        <button
                          onClick={() => toggle(day, hour)}
                          title={status === 'booked' ? 'Already booked' : status === 'available' ? 'Click to remove' : 'Click to set available'}
                          className={`w-full h-8 rounded-lg text-xs font-medium transition-all ${
                            status === 'booked'
                              ? 'bg-blue-100 border border-blue-200 text-blue-600 cursor-not-allowed'
                              : status === 'available'
                              ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-gray-50 border border-dashed border-gray-200 text-gray-300 hover:bg-gray-100 hover:border-emerald-300 hover:text-emerald-500'
                          }`}
                        >
                          {status === 'booked' ? '●' : status === 'available' ? <X className="w-3 h-3 mx-auto" /> : <Plus className="w-3 h-3 mx-auto" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          {t('teacher.availability.timezoneNote')} <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>
        </p>
      </div>
    </div>
  );
}
