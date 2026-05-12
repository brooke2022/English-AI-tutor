import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { t } = useTranslation();

  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      const defaultDest = user.role === 'teacher' ? '/teacher/dashboard' : user.role === 'admin' ? '/admin' : '/student/dashboard';
      navigate(redirect && redirect.startsWith('/') ? redirect : defaultDest, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">TutorAI</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.login.title')}</h1>
          <p className="text-gray-500 mb-8 text-sm">{t('auth.login.subtitle')}</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.login.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.login.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input type="checkbox" className="rounded border-gray-300" />
                {t('auth.login.rememberMe')}
              </label>
              <span className="text-gray-400 text-xs">{t('auth.login.forgotPassword')}</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : t('auth.login.signIn')
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">{t('auth.login.signUp')}</Link>
          </p>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 space-y-1">
            <p className="font-semibold mb-1">{t('auth.login.demoAccounts')}</p>
            <p>🎓 Student: <span className="font-mono">student@test.com</span> / <span className="font-mono">password123</span></p>
            <p>👩‍🏫 Tutor: <span className="font-mono">teacher@test.com</span> / <span className="font-mono">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
