import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, GraduationCap, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student'
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', formData);
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        alert(`Welcome ${user.name}! 🎉`);

      
        const role = user.role.toLowerCase();
        if (role === 'student') {
          navigate('/student-dashboard');
        } else if (role === 'company') {
          navigate('/company-dashboard');
        } else if (role === 'admin') {
          navigate('/admin-dashboard');
        }
      }
    } catch (err) {
      console.error("Full Error Object:", err);
      
      const errorMsg = err.response?.data?.message || "حدث خطأ غير متوقع";
      const errorDetail = err.response?.data?.error || "";
      alert(`${errorMsg} \n ${errorDetail}`);
    }
  };

  return (
    <>
      <style>{`
        .login-container { display: flex; height: 100vh; width: 100vw; font-family: 'Inter', sans-serif; overflow: hidden; }
        .login-side-image { flex: 1.2; background: linear-gradient(135deg, #82CAFF 0%, #4da3e0 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 40px; }
        .login-side-image h2 { font-size: 3rem; margin-bottom: 10px; font-weight: 800; }
        .login-side-form { flex: 0.8; background: white; display: flex; justify-content: center; align-items: center; padding: 40px; }
        .form-box { width: 100%; max-width: 350px; }
        .input-wrapper { margin-bottom: 20px; position: relative; }
        .input-wrapper label { display: block; margin-bottom: 8px; font-size: 0.85rem; font-weight: 600; color: #555; }
        .input-wrapper input, .input-wrapper select { width: 100%; padding: 12px 15px 12px 40px; border: 1.5px solid #eee; border-radius: 8px; outline: none; background: #f9f9f9; box-sizing: border-box; }
        .input-wrapper input:focus, .input-wrapper select:focus { border-color: #82CAFF; background: white; box-shadow: 0 0 0 4px rgba(130, 202, 255, 0.2); }
        .btn-login { width: 100%; padding: 14px; background: #82CAFF; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 1rem; }
        .icon { position: absolute; left: 12px; bottom: 13px; color: #aaa; z-index: 10; }
      `}</style>

      <div className="login-container">
        <div className="login-side-image">
          <UserPlus size={100} strokeWidth={1.5} />
          <h2>Stag.io</h2>
          <p>Create your account and start applying for internships.</p>
        </div>

        <div className="login-side-form">
          <div className="form-box">
            <h1>Sign Up</h1>
            <p>Enter your details to create an account.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <label>Full Name</label>
                <User className="icon" size={18} />
                <input type="text" placeholder="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="input-wrapper">
                <label>Email Address</label>
                <Mail className="icon" size={18} />
                <input type="email" placeholder="name@role.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className="input-wrapper">
                <label>Password</label>
                <Lock className="icon" size={18} />
                <input type="password" placeholder="••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>

              <div className="input-wrapper">
                <label>Register as:</label>
                <GraduationCap className="icon" size={18} />
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                </select>
              </div>

              <button type="submit" className="btn-login">
                Create Account <ChevronRight size={18} />
              </button>
            </form>
            <div style={{marginTop: '20px', textAlign: 'center'}}>
              Already have an account? <Link to="/" style={{color: '#82CAFF', fontWeight: 'bold'}}>Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;