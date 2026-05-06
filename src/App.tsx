/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import AIMatch from './pages/AIMatch';
import MyCourses from './pages/MyCourses';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<TeacherDetail />} />
            <Route path="/ai-match" element={<AIMatch />} />
            <Route path="/my-courses" element={<MyCourses />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
