import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Clock, LogOut, FileText, User, Mail, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
  const [conventions, setConventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); 
  const [adminData, setAdminData] = useState({ name: 'Admin', email: '...', role: 'Administrator' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const convRes = await api.get('/admin/conventions');
        setConventions(convRes.data || []);

        const userRes = await api.get('/auth/me');
        if (userRes.data) {
          setAdminData({
            name: userRes.data.name || userRes.data.username || "Admin User",
            email: userRes.data.email || "No Email",
            role: userRes.data.role || "Administrator"
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleValidate = async (id) => {
    try {
      await api.put(`/admin/conventions/${id}`, { status: 'approved' });
      const res = await api.get('/admin/conventions');
      setConventions(res.data);
    } catch (err) {
      alert("Error validating convention");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center', color: '#82CAFF'}}>Loading...</div>;

  return (
    <>
      <style>{`
        .admin-layout { display: flex; min-height: 100vh; background-color: #f8fbff; font-family: 'Inter', sans-serif; }
        .sidebar { width: 100px; background: white; border-right: 1px solid #eef2f6; display: flex; flex-direction: column; align-items: center; padding: 25px 0; position: fixed; height: 100vh; z-index: 100; }
        .logo-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
        .logo-box { width: 45px; height: 45px; background: #82CAFF; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem; }
        .logo-text { font-size: 0.75rem; font-weight: 700; color: #1a202c; margin-top: 8px; }
        .side-link { color: #b0c4d9; margin-bottom: 30px; cursor: pointer; transition: 0.3s; padding: 12px; border-radius: 15px; }
        .side-link.active { color: #82CAFF; background: #f0f7ff; }
        
        /* ستايل زر الخروج الأحمر */
        .side-link.logout { color: #ff6b6b; margin-top: auto; }
        .side-link.logout:hover { background: #fff5f5; }

        .main-container { flex: 1; margin-left: 100px; padding: 25px 40px; }
        .top-bar { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .nav-avatar { width: 40px; height: 40px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; color: #cbd5e0; border: 1px solid #f1f5f9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
        .stat-icon { width: 45px; height: 45px; border-radius: 12px; background: #f0f7ff; color: #82CAFF; display: flex; align-items: center; justify-content: center; }
        .table-card { background: white; border-radius: 24px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow-x: auto; }
        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .modern-table th { padding: 15px; text-align: left; color: #a0aec0; font-size: 0.75rem; text-transform: uppercase; }
        .modern-table td { padding: 18px 15px; background: #fff; border-top: 1px solid #f8fafc; border-bottom: 1px solid #f8fafc; }
        .status-pill { padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; }
        .status-pending { background: #fff8eb; color: #f6ad55; }
        .status-approved { background: #f0fff4; color: #38a169; }
        .btn-validate { background: #82CAFF; color: white; border: none; padding: 8px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .profile-container { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); max-width: 600px; margin: 0 auto; text-align: center; }
        .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f8fafc; }
        .value { color: #2d3748; font-weight: 600; }
      `}</style>

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="logo-container">
            <div className="logo-box">S</div>
            <span className="logo-text">stag.io</span>
          </div>
          <div className={`side-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={24} />
          </div>
          <div className={`side-link ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>
            <User size={24} />
          </div>
          
          {/* زر الخروج باللون الأحمر */}
          <div className="side-link logout" onClick={handleLogout}>
            <LogOut size={24} />
          </div>
        </aside>

        <main className="main-container">
          <header className="top-bar">
            <div className="nav-avatar"><User size={20} /></div>
          </header>

          {view === 'dashboard' ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><FileText size={20}/></div>
                  <div>
                    <p style={{margin:0, color:'#a0aec0', fontSize:'0.8rem'}}>Total</p>
                    <h3 style={{margin:0}}>{conventions.length}</h3>
                  </div>
                </div>
              </div>
              <div className="table-card">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Internship</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conventions.map((conv) => (
                      <tr key={conv.id}>
                        <td><b>{conv.student_name}</b></td>
                        <td>{conv.offer_title || "N/A"}</td>
                        <td>{conv.company_name}</td>
                        <td><span className={`status-pill status-${conv.status}`}>{conv.status}</span></td>
                        <td>
                          {conv.status === 'pending' ? (
                            <button className="btn-validate" onClick={() => handleValidate(conv.id)}>Validate</button>
                          ) : <span style={{color: '#38a169', fontWeight: 600}}>Approved ✅</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="profile-container">
               <div style={{width: 80, height: 80, background: '#f0f7ff', borderRadius: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20}}>
                  <User size={40} color="#82CAFF" />
               </div>
               <h2>{adminData.name}</h2>
               <div className="info-row">
                  <span><Mail size={16}/> Email</span>
                  <span className="value">{adminData.email}</span>
               </div>
               <div className="info-row">
                  <span><ShieldCheck size={16}/> Role</span>
                  <span className="value">{adminData.role}</span>
               </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;