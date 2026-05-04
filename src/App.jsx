import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard'; 
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard'; // 1. استيراد صفحة الأدمن الجديدة

function App() {
  // دالة مساعدة لتوجيه المستخدم تلقائياً بناءً على الـ Role
  const getDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Navigate to="/" />;

    // التوجيه حسب نوع المستخدم
    if (user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'company') return <CompanyDashboard />;
    return <StudentDashboard />;
  };

  return (
    <Router>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* مسارات المستخدمين (مباشرة) */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* 2. إضافة مسار الأدمن */}

        {/* المسار الذكي: يوجهك للوحة التحكم المناسبة لك فور تسجيل الدخول */}
        <Route path="/dashboard" element={getDashboard()} />
        
        {/* إعادة توجيه أي مسار غير موجود إلى صفحة Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;