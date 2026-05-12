import React, { useState } from 'react';
import { CheckCircle2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

const GOALS = ['IELTS', 'Business', 'Conversation', 'Kids', 'Job Interview'];
const LANGUAGES = ['Chinese', 'Japanese', 'Korean', 'Spanish', 'French', 'Portuguese', 'Arabic', 'Russian', 'Other'];
const LEVELS = ['Beginner (A1-A2)', 'Elementary (A2-B1)', 'Intermediate (B1-B2)', 'Upper-Intermediate (B2)', 'Advanced (C1-C2)'];

export default function StudentProfile() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: user?.name || '',
    nativeLanguage: '',
    learningGoals: [] as string[],
    targetLevel: '',
    city: '',
  });
  const [saved, setSaved] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const toggleGoal = (goal: string) =>
    setForm((f) => ({
      ...f,
      learningGoals: f.learningGoals.includes(goal)
        ? f.learningGoals.filter((g) => g !== goal)
        : [...f.learningGoals, goal],
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: form.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('student.profile.title')}</h1>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                {t('nav.roles.student')}
              </span>
            </div>
          </div>

          {/* Basic info form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('student.profile.basicInfo')}</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('student.profile.fullName')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('student.profile.email')}</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('student.profile.city')}</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder={t('student.profile.cityPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('student.profile.nativeLang')}</label>
                  <select
                    value={form.nativeLanguage}
                    onChange={(e) => setForm((f) => ({ ...f, nativeLanguage: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  >
                    <option value="">{t('common.select')}</option>
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('student.profile.targetLevel')}</label>
                  <select
                    value={form.targetLevel}
                    onChange={(e) => setForm((f) => ({ ...f, targetLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  >
                    <option value="">{t('common.select')}</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('student.profile.goals')}</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        form.learningGoals.includes(goal)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : t('student.profile.save')
                  }
                </button>
                {saved && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('student.profile.saved')}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Password section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('student.profile.password')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('student.profile.passwordSub')}</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                {showPasswordForm ? t('student.profile.cancel') : t('student.profile.change')}
              </button>
            </div>

            {showPasswordForm && (
              <div className="mt-6 space-y-4">
                <input type="password" placeholder={t('student.profile.currentPassword')} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm" />
                <input type="password" placeholder={t('student.profile.newPassword')} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm" />
                <input type="password" placeholder={t('student.profile.confirmNewPassword')} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm" />
                <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors text-sm">
                  {t('student.profile.updatePassword')}
                </button>
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>{t('student.profile.memberSince', { date: new Date(user?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
