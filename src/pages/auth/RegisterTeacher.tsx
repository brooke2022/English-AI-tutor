import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useTeachersStore } from '../../store/useTeachersStore';

const SPECIALTIES = ['IELTS', 'Business', 'Kids', 'Conversational', 'Beginners', 'Job Interview', 'Pronunciation', 'Advanced'];
const COUNTRIES = ['Philippines', 'Nepal', 'India', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Other'];

export default function RegisterTeacher() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    tags: [] as string[],
    price: '',
    trialPrice: '',
    intro: '',
    whatsapp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const toggleTag = (tag: string) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
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
    if (!form.country) {
      setValidationError(t('auth.errors.selectCountry'));
      return;
    }
    if (form.tags.length === 0) {
      setValidationError(t('auth.errors.selectSpecialty'));
      return;
    }
    setValidationError('');
    await register(
      {
        name: form.name,
        email: form.email,
        password: form.password,
        country: form.country,
        timezone: form.timezone,
        tags: form.tags,
        price: Number(form.price),
        trialPrice: Number(form.trialPrice),
        intro: form.intro,
      },
      'teacher'
    );
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      const countryCode = form.country === 'Philippines' ? 'PH'
        : form.country === 'Nepal' ? 'NP'
        : form.country === 'India' ? 'IN'
        : form.country === 'South Africa' ? 'ZA'
        : form.country === 'United Kingdom' ? 'GB'
        : form.country === 'United States' ? 'US'
        : form.country === 'Canada' ? 'CA'
        : form.country === 'Australia' ? 'AU'
        : 'UN';
      useTeachersStore.getState().addTeacher({
        id: `tutor-${Date.now()}`,
        userId: user.id,
        name: form.name,
        country: form.country,
        countryCode,
        avatar: `https://picsum.photos/seed/${form.name.toLowerCase().replace(' ', '')}/200/200`,
        tags: form.tags,
        price: Number(form.price),
        trialPrice: Number(form.trialPrice),
        rating: 0,
        reviewCount: 0,
        timezone: form.timezone,
        intro: form.intro,
        videoUrl: '',
        availableSlots: [],
        reviews: [],
        whatsapp: form.whatsapp || undefined,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      navigate('/teacher/dashboard', { replace: true });
    }
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
            <ChevronLeft className="w-4 h-4" /> {t('auth.registerTeacher.back')}
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.registerTeacher.title')}</h1>
          <p className="text-gray-500 text-sm mb-8">{t('auth.registerTeacher.subtitle')}</p>

          {displayError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.fullName')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t('auth.registerTeacher.fullNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.email')}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setValidationError(''); }}
                  placeholder={t('auth.registerTeacher.passwordPlaceholder')}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.confirmPassword')}</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => { setForm((f) => ({ ...f, confirmPassword: e.target.value })); setValidationError(''); }}
                placeholder={t('auth.registerTeacher.confirmPasswordPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.country')}</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                >
                  <option value="">{t('auth.registerTeacher.countrySelect')}</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.timezone')}</label>
                <input
                  type="text"
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.registerTeacher.specialties')}</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.tags.includes(tag)
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.hourlyRate')}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 12"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.registerTeacher.trialPrice')}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.trialPrice}
                  onChange={(e) => setForm((f) => ({ ...f, trialPrice: e.target.value }))}
                  placeholder="e.g. 2"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.registerTeacher.bio')} <span className="text-gray-400 font-normal">{t('auth.registerTeacher.bioLimit')}</span>
              </label>
              <textarea
                required
                maxLength={300}
                rows={4}
                value={form.intro}
                onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
                placeholder="Tell students about yourself, your experience, and teaching style..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.intro.length}/300</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.registerTeacher.whatsapp')} <span className="text-gray-400 font-normal">{t('auth.registerTeacher.whatsappOptional')}</span>
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder={t('auth.registerTeacher.whatsappPlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : t('auth.registerTeacher.createAccount')
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.registerTeacher.alreadyHave')}{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">{t('auth.registerTeacher.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
