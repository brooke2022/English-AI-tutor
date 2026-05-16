import { useState, useRef, useEffect } from 'react';
import { GraduationCap, ChevronDown, LogOut, User, LayoutDashboard, BookOpen, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import { useRealtimeNotifications } from '../hooks/useNotifications';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  useRealtimeNotifications(isAuthenticated);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const studentMenuItems = [
    { to: '/student/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: t('nav.dashboard') },
    { to: '/student/courses', icon: <BookOpen className="w-4 h-4" />, label: t('myCourses.title') },
    { to: '/student/profile', icon: <User className="w-4 h-4" />, label: t('student.profile.title') },
  ];

  const teacherMenuItems = [
    { to: '/teacher/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: t('nav.dashboard') },
    { to: '/teacher/profile', icon: <User className="w-4 h-4" />, label: t('nav.myProfile') },
    { to: '/teacher/bookings', icon: <BookOpen className="w-4 h-4" />, label: t('nav.bookings') },
  ];

  const adminMenuItems = [
    { to: '/admin', icon: <ShieldCheck className="w-4 h-4" />, label: t('nav.adminPanel') },
  ];

  const menuItems = user?.role === 'teacher' ? teacherMenuItems : user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">TutorAI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/teachers" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.findTutors')}
            </Link>
            <Link to="/ai-match" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent font-semibold">
                {t('nav.aiMatch')}
              </span>
            </Link>
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/student/courses" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                {t('nav.myCourses')}
              </Link>
            )}
          </div>

          {/* Right side: language switcher + auth */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated && <NotificationBell />}

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {t('nav.signup')}
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-1.5 pr-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user?.role === 'teacher' ? 'bg-violet-50 text-violet-700' : user?.role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user?.role === 'teacher' ? t('nav.roles.teacher') : user?.role === 'admin' ? t('nav.roles.admin') : t('nav.roles.student')}
                      </span>
                    </div>

                    <div className="py-1">
                      {menuItems.map(({ to, icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-400">{icon}</span>
                          {label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900 p-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
