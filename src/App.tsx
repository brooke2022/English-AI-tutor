/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import AIMatch from './pages/AIMatch';
import MyCourses from './pages/MyCourses';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterStudent from './pages/auth/RegisterStudent';
import RegisterTeacher from './pages/auth/RegisterTeacher';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherAvailability from './pages/teacher/TeacherAvailability';
import TeacherBookings from './pages/teacher/TeacherBookings';

import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<TeacherDetail />} />
            <Route path="/ai-match" element={<AIMatch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/student" element={<RegisterStudent />} />
            <Route path="/register/teacher" element={<RegisterTeacher />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute role="student"><MyCourses /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

            {/* Teacher routes */}
            <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />
            <Route path="/teacher/availability" element={<ProtectedRoute role="teacher"><TeacherAvailability /></ProtectedRoute>} />
            <Route path="/teacher/bookings" element={<ProtectedRoute role="teacher"><TeacherBookings /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

            {/* Legacy my-courses redirect */}
            <Route path="/my-courses" element={<ProtectedRoute role="student"><MyCourses /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
