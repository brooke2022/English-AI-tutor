import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              TutorAI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/teachers"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Find Tutors
            </Link>
            <Link
              to="/ai-match"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent font-semibold">
                ✨ AI Match
              </span>
            </Link>
            <Link
              to="/my-courses"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Courses
            </Link>
          </div>

          {/* Mobile Menu Placeholder (Optional) */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
