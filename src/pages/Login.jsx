import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Mail, Lock, GraduationCap, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // إرسال الإيميل بحروف صغيرة لتجنب أخطاء المطابقة
      const response = await api.post('/login', { 
        email: email.toLowerCase(), 
        password 
      });
      
      const { token, user } = response.data;

      if (token) {
        // حفظ التوكن
        localStorage.setItem('token', token);
        
        // تأكد من أن كائن المستخدم يحتوي على الإيميل قبل الحفظ
        // إذا لم يرسله الـ API، سنقوم بإضافته يدوياً من الحقل الذي أدخله المستخدم
        const userData = {
          ...user,
          email: user.email || email.toLowerCase() 
        };

        localStorage.setItem('user', JSON.stringify(userData));

        const userRole = user?.role;
        if (userRole) {
          alert("Welcome to Stag.io! ✅");
          const role = userRole.toLowerCase();

          if (role === 'student') {
            navigate('/student-dashboard');
          } else if (role === 'company') {
            navigate('/company-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard'); 
          }
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Connection failed";
      alert("Error: " + errorMessage);
    }
  };

  return (
    <>
      <style>{`
        .login-container { display: flex; height: 100vh; width: 100vw; font-family: 'Inter', sans-serif; overflow: hidden; }
        .login-side-image { flex: 1.2; background: linear-gradient(135deg, #82CAFF 0%, #4da3e0 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 40px; position: relative; }
        .login-side-image h2 { font-size: 3.5rem; margin-bottom: 10px; font-weight: 800; }
        .login-side-image p { font-size: 1.2rem; opacity: 0.9; text-align: center; max-width: 400px; }
        .login-side-form { flex: 0.8; background: white; display: flex; justify-content: center; align-items: center; padding: 40px; }
        .form-box { width: 100%; max-width: 350px; }
        .form-box h1 { font-size: 2.2rem; color: #333; margin-bottom: 10px; font-weight: 700; }
        .input-wrapper { margin-bottom: 20px; position: relative; }
        .input-wrapper label { display: block; margin-bottom: 8px; font-size: 0.85rem; font-weight: 600; color: #555; }
        .input-wrapper input { width: 100%; padding: 12px 15px 12px 40px; border: 1.5px solid #eee; border-radius: 8px; outline: none; transition: 0.3s; background: #f9f9f9; box-sizing: border-box; }
        .input-wrapper input:focus { border-color: #82CAFF; background: white; box-shadow: 0 0 0 4px rgba(130, 202, 255, 0.2); }
        .input-wrapper .icon { position: absolute; left: 12px; bottom: 13px; color: #aaa; }
        .btn-login { width: 100%; padding: 14px; background: #82CAFF; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; font-size: 1rem; }
        .btn-login:hover { background: #6bb9f0; transform: translateY(-2px); }
        .signup-text { margin-top: 25px; text-align: center; font-size: 0.9rem; color: #777; }
        .signup-text a { color: #4da3e0; text-decoration: none; font-weight: 700; }
        @media (max-width: 900px) { .login-side-image { display: none; } .login-side-form { flex: 1; } }
      `}</style>
      <div className="login-container">
        <div className="login-side-image">
          <GraduationCap size={100} strokeWidth={1.5} />
          <h2>Stag.io</h2>
          <p>The simplest path to student internships</p>
        </div>
        <div className="login-side-form">
          <div className="form-box">
            <h1>Login</h1>
            <p>Welcome back! Please enter your details.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <label>Email Address</label>
                <Mail className="icon" size={18} />
                <input 
                  type="email" 
                  placeholder="name@role.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-wrapper">
                <label>Password</label>
                <Lock className="icon" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn-login">Sign In <ChevronRight size={18} /></button>
            </form>
            <div className="signup-text">Don't have an account? <Link to="/register">Create an Account</Link></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;