import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, PlusCircle, Users, User, LogOut, 
  Trash2, CheckCircle2, XCircle, Building2,
  Mail, UserCircle, FileText, BarChart3
} from 'lucide-react';
import api from '../api/axios';

const CompanyDashboard = () => {
  const [myOffers, setMyOffers] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [user, setUser] = useState(null);
  const [newOffer, setNewOffer] = useState({ title: '', description: '' });
  
  const navigate = useNavigate();
  const mainColor = '#82CAFF'; 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) { navigate('/'); return; }
    if (storedUser) setUser(JSON.parse(storedUser));
    
    fetchCompanyData();
  }, [navigate]);

  // دالة جلب البيانات: تم فصل الطلبات لضمان استقرار العرض
  const fetchCompanyData = async () => {
    try {
      const offersRes = await api.get('/my-offers');
      setMyOffers(offersRes.data);
      
      const appsRes = await api.get('/company-applications');
      setAllApplications(appsRes.data);
    } catch (err) {
      console.error("Error fetching company data:", err.response?.data || err);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/offers', newOffer);
      alert("Offer published successfully! 🚀");
      setNewOffer({ title: '', description: '' });
      setActiveTab('overview');
      fetchCompanyData();
    } catch (err) {
      alert("Failed to create offer.");
    }
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await api.delete(`/offers/${id}`);
        fetchCompanyData();
      } catch (err) {
        alert("Error deleting offer.");
      }
    }
  };

  // تصحيح الرابط هنا ليتوافق مع السيرفر (/applications/:id)
  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}`, { status });
      fetchCompanyData();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={{...styles.logoIcon, backgroundColor: mainColor}}>S</div>
          <span style={styles.logoText}>Stag.io</span>
        </div>
        <nav style={styles.navStack}>
          <div style={{...styles.navLink, ...(activeTab === 'overview' ? {color: mainColor, backgroundColor: '#f0f9ff'} : {})}} onClick={() => setActiveTab('overview')} title="Dashboard"><LayoutGrid size={22} /></div>
          <div style={{...styles.navLink, ...(activeTab === 'post' ? {color: mainColor, backgroundColor: '#f0f9ff'} : {})}} onClick={() => setActiveTab('post')} title="Post New Offer"><PlusCircle size={22} /></div>
          <div style={{...styles.navLink, ...(activeTab === 'applicants' ? {color: mainColor, backgroundColor: '#f0f9ff'} : {})}} onClick={() => setActiveTab('applicants')} title="Applicants"><Users size={22} /></div>
          <div style={{...styles.navLink, ...(activeTab === 'profile' ? {color: mainColor, backgroundColor: '#f0f9ff'} : {})}} onClick={() => setActiveTab('profile')} title="Profile"><User size={22} /></div>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.exitBtn}><LogOut size={22} /></button>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.welcomeText}>Welcome, {user?.name || 'Company'}!</h1>
          <div onClick={() => setActiveTab('profile')} style={{...styles.avatar, backgroundColor: '#f0f9ff', border: `1px solid ${mainColor}`, cursor: 'pointer'}}>
            <Building2 size={24} color={mainColor} />
          </div>
        </header>

        
        {activeTab === 'overview' && (
          <section>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <BarChart3 size={24} color={mainColor} />
                <div><p style={styles.statLabel}>Active Offers</p><h2 style={styles.statValue}>{myOffers.length}</h2></div>
              </div>
              <div style={styles.statCard}>
                <Users size={24} color="#10B981" />
                <div><p style={styles.statLabel}>Total Applicants</p><h2 style={styles.statValue}>{allApplications.length}</h2></div>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>My Published Offers</h2>
            <div style={styles.offersGrid}>
              {myOffers.length > 0 ? myOffers.map(offer => (
                <div key={offer.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{offer.title}</h3>
                    <button onClick={() => handleDeleteOffer(offer.id)} style={styles.deleteBtn}><Trash2 size={18} /></button>
                  </div>
                  <p style={styles.cardText}>{offer.description}</p>
                  <div style={styles.cardFooter}>
                    <FileText size={14} /> <span>{allApplications.filter(a => a.offer_id === offer.id).length} Applicants</span>
                  </div>
                </div>
              )) : <p>No offers published yet.</p>}
            </div>
          </section>
        )}

       
        {activeTab === 'post' && (
          <section style={styles.formContainer}>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>Create New Internship</h2>
              <form onSubmit={handleCreateOffer} style={styles.form}>
                <label style={styles.label}>Offer Title</label>
                <input 
                  style={styles.input} 
                  placeholder="Enter the title" 
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  required 
                />
                <label style={styles.label}>Detailed Description</label>
                <textarea 
                  style={{...styles.input, height: '150px', resize: 'none'}} 
                  placeholder="Provide a description of your offer..."
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  required
                />
                <button type="submit" style={{...styles.submitBtn, backgroundColor: mainColor}}>Publish Internship</button>
              </form>
            </div>
          </section>
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <section>
            <h2 style={styles.sectionTitle}>Recent Applications</h2>
            <div style={styles.listStack}>
              {allApplications.length > 0 ? allApplications.map(app => (
                <div key={app.id} style={styles.appCard}>
                  <div style={styles.cardInfo}>
                    <div style={{...styles.iconBox, backgroundColor: '#f0f9ff'}}><UserCircle size={24} color={mainColor} /></div>
                    <div>
                      <h3 style={styles.offerTitle}>{app.student_name}</h3>
                      <p style={{margin:0, fontSize:'12px', color:'#64748b'}}>Applied for: <b>{app.offer_title}</b></p>
                    </div>
                  </div>
                  <div style={styles.appActions}>
                    {app.status === 'pending' ? (
                      <>
                        <button onClick={() => handleUpdateStatus(app.id, 'accepted')} style={styles.acceptBtn}><CheckCircle2 size={18} /> Accept</button>
                        <button onClick={() => handleUpdateStatus(app.id, 'rejected')} style={styles.rejectBtn}><XCircle size={18} /> Reject</button>
                      </>
                    ) : (
                      <div style={{...styles.statusTag, backgroundColor: app.status === 'accepted' ? '#D1FAE5' : '#FEE2E2', color: app.status === 'accepted' ? '#10B981' : '#EF4444'}}>
                        {app.status.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              )) : <p>No applications received yet.</p>}
            </div>
          </section>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <section style={styles.profileContainer}>
            <div style={styles.profileCard}>
              <div style={{...styles.profileAvatar, backgroundColor: mainColor}}><Building2 size={40} color="#fff" /></div>
              <h2 style={styles.profileName}>{user?.name}</h2>
              <p style={styles.profileBadge}>Verified Company</p>
              <div style={styles.infoItem}><Mail size={20} color={mainColor} /> <span>{user?.email}</span></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

// Styles
const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#FBFDFF', fontFamily: "'Inter', sans-serif" },
  sidebar: { width: '80px', backgroundColor: '#fff', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '25px 0', position: 'sticky', top: 0, height: '100vh', zIndex: 10 },
  logoSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '8px' },
  logoIcon: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '20px' },
  logoText: { fontSize: '10px', fontWeight: '700', color: '#1e293b' },
  navStack: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
  navLink: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: '0.2s' },
  exitBtn: { marginTop: 'auto', border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', padding: '10px' },
  mainContent: { flex: 1, padding: '30px 50px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  welcomeText: { fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: '20px', color: '#1e293b', marginBottom: '20px', fontWeight: '700' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' },
  statLabel: { margin: 0, color: '#64748b', fontSize: '14px' },
  statValue: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' },
  offersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' },
  deleteBtn: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' },
  cardText: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
  cardFooter: { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f8fafc', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' },
  formContainer: { display: 'flex', justifyContent: 'center' },
  formCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9', width: '100%', maxWidth: '600px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#475569' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' },
  submitBtn: { padding: '15px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer', marginTop: '10px' },
  listStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  appCard: { backgroundColor: '#fff', padding: '15px 20px', borderRadius: '18px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconBox: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  offerTitle: { fontSize: '15px', margin: 0, fontWeight: '600' },
  appActions: { display: 'flex', gap: '8px' },
  acceptBtn: { border: 'none', backgroundColor: '#10B981', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' },
  rejectBtn: { border: 'none', backgroundColor: '#EF4444', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' },
  statusTag: { padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' },
  profileContainer: { display: 'flex', justifyContent: 'center', paddingTop: '40px' },
  profileCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '25px', textAlign: 'center', width: '350px', border: '1px solid #f1f5f9' },
  profileAvatar: { width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: '22px', margin: '0 0 5px 0' },
  profileBadge: { fontSize: '13px', color: '#94a3b8', marginBottom: '20px' },
  infoItem: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#475569' }
};

export default CompanyDashboard;