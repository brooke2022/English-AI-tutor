import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

const GOALS = ['IELTS', 'Business', 'Conversation', 'Kids', 'Job Interview'];
const LANGUAGES = ['Chinese', 'Japanese', 'Korean', 'Spanish', 'French', 'Portuguese', 'Arabic', 'Russian', 'Other'];

export default function RegisterStudent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nativeLanguage: '',
    learningGoals: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const toggleGoal = (goal: string) =>
    setForm((f) => ({
      ...f,
      learningGoals: f.learningGoals.includes(goal)
        ? f.learningGoals.filter((g) => g !== goal)
        : [...f.learningGoals, goal],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setValidationError(t('auth.errors.passwordMin'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setValidationError(t('auth.errors.passwordMatch'));
      return;
    }
    setValidationError('');
    await register(
      { name: form.name, email: form.email, password: form.password, nativeLanguage: form.nativeLanguage || undefined, learningGoals: form.learningGoals },
      'student'
    );
    if (useAuthStore.getState().isAuthenticated) navigate('/student/dashboard', { replace: true });
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">TutorAI</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Link to="/register" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ChevronLeft className="w-4 h-4" /> {t('auth.registerStudent.back')}
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.registerStudent.title')}</h1>
          <p className="text-gray-500 text-sm mb-8">{t('auth.registerStudent.subtitle')}</p>

          {displayError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerStudent.fullName')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('auth.registerStudent.fullNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerStudent.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); clearError(); }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerStudent.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setValidationError(''); }}
                  placeholder={t('auth.registerStudent.passwordPlaceholder')}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerStudent.confirmPassword')}</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => { setForm((f) => ({ ...f, confirmPassword: e.target.value })); setValidationError(''); }}
                placeholder={t('auth.registerStudent.confirmPasswordPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.registerStudent.nativeLang')} <span className="text-gray-400 font-normal">{t('auth.registerStudent.optional')}</span>
              </label>
              <select
                value={form.nativeLanguage}
                onChange={(e) => setForm((f) => ({ ...f, nativeLanguage: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              >
                <option value="">{t('auth.registerStudent.nativeLangSelect')}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.registerStudent.goals')} <span className="text-gray-400 font-normal">{t('auth.registerStudent.optional')}</span>
              </label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : t('auth.registerStudent.createAccount')
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.registerStudent.alreadyHave')}{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">{t('auth.registerStudent.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
