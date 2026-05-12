import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  role?: 'student' | 'teacher' | 'admin';
  children: React.ReactNode;
}

export default function ProtectedRoute({ role, children }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (role && user?.role !== role) {
    const fallback =
      user?.role === 'admin' ? '/admin' :
      user?.role === 'teacher' ? '/teacher/dashboard' :
      '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
