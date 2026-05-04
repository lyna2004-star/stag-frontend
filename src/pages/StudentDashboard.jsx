import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Send, Clock, User, LogOut, Search, 
  MapPin, CheckCircle2, Building2, AlertCircle,
  UserCircle, PlusCircle, Download, X
} from 'lucide-react';
import api from '../api/axios';

const StudentDashboard = () => {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('my-apps'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const navigate = useNavigate();
  const mainColor = '#82CAFF';

  const fetchData = useCallback(async () => {
    try {
      const [offersRes, appsRes] = await Promise.all([
        api.get('/offers'),
        api.get('/my-applications')
      ]);
      setOffers(offersRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) {
      navigate('/');
      return;
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchData();
  }, [navigate, fetchData]);

  const downloadPDF = async (appId) => {
    try {
      const res = await api.get(`/conventions/${appId}/pdf`, { 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Convention_${appId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert("⚠️ Document not ready yet. Both Company and Admin must approve.");
      } else {
        alert("❌ Error downloading the file.");
      }
    }
  };

  const applyToOffer = async (id) => {
    try {
      await api.post('/applications', { offer_id: id });
      alert("Application sent successfully! ✅");
      setSelectedOffer(null);
      fetchData();
    } catch (err) {
      alert("You already applied or something went wrong.");
    }
  };

  // وظيفة للتحقق من القبول (Accepted/Approved)
  const isApproved = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return s === 'accepted' || s === 'approved';
  };

  // وظيفة جديدة للتحقق من الرفض (Rejected)
  const isRejected = (companyStatus, adminStatus) => {
    const s = companyStatus?.toLowerCase().trim();
    const a = adminStatus?.toLowerCase().trim();
    return s === 'rejected' || a === 'rejected';
  };

  const getStatusColor = (status) => {
    if (isApproved(status)) return '#10B981'; // Green
    if (status?.toLowerCase().trim() === 'rejected') return '#EF4444'; // Red
    return '#F59E0B'; // Orange/Yellow
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={{...styles.logoIcon, backgroundColor: mainColor}}>S</div>
          <span style={styles.logoText}>Stag.io</span>
        </div>
        <nav style={styles.navStack}>
          <div style={{...styles.navLink, ...(activeTab === 'explore' ? styles.activeNavLink : {})}} onClick={() => setActiveTab('explore')}><LayoutGrid size={22} /></div>
          <div style={{...styles.navLink, ...(activeTab === 'my-apps' ? styles.activeNavLink : {})}} onClick={() => setActiveTab('my-apps')}><Send size={22} /></div>
          <div style={{...styles.navLink, ...(activeTab === 'profile' ? styles.activeNavLink : {})}} onClick={() => setActiveTab('profile')}><User size={22} /></div>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.exitBtn}><LogOut size={22} /></button>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search..." style={styles.searchField} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        {activeTab === 'explore' && (
          <div style={styles.offersGrid}>
            {offers.filter(o => o.title.toLowerCase().includes(searchTerm.toLowerCase())).map(offer => (
                <div key={offer.id} style={styles.card} onClick={() => setSelectedOffer(offer)}>
                  <div style={styles.cardHeader}><h3>{offer.title}</h3><PlusCircle size={20} color={mainColor} /></div>
                  <p style={styles.cardText}>{offer.description?.substring(0, 100)}...</p>
                  <div style={styles.cardFooter}><MapPin size={14} /> View Details</div>
                </div>
            ))}
          </div>
        )}

        {activeTab === 'my-apps' && (
          <section>
            <h2 style={{ marginBottom: '25px', color: '#1e293b' }}>My Applications</h2>
            <div style={styles.listStack}>
              {applications.map((app) => {
                const companyOk = isApproved(app.status);
                const adminOk = isApproved(app.admin_status);
                const hasBeenRejected = isRejected(app.status, app.admin_status);

                return (
                  <div key={app.id} style={styles.appCard}>
                    <div style={styles.cardInfo}>
                      <Building2 size={24} color={mainColor} />
                      <div>
                        <h4 style={{ margin: 0 }}>{app.offer_title}</h4>
                        <div style={{ fontSize: '11px', marginTop: '6px', display: 'flex', gap: '10px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Company: </span>
                            <span style={{ color: getStatusColor(app.status), fontWeight: '600' }}>{app.status}</span>
                          </div>
                          <span style={{ color: '#cbd5e1' }}>|</span>
                          <div>
                            <span style={{ color: '#64748b' }}>Admin: </span>
                            <span style={{ color: getStatusColor(app.admin_status), fontWeight: '600' }}>{app.admin_status || 'waiting'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {/* الحالة 1: قبول كامل */}
                      {companyOk && adminOk ? (
                        <button onClick={() => downloadPDF(app.id)} style={styles.downloadBtn}>
                          <Download size={14} /> Download Convention
                        </button>
                      ) : 
                      /* الحالة 2: رفض من طرف واحد على الأقل */
                      hasBeenRejected ? (
                        <div style={{ ...styles.statusBadge, color: '#EF4444', backgroundColor: '#FEF2F2' }}>
                          <AlertCircle size={16} />
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>Rejected</span>
                        </div>
                      ) : (
                        /* الحالة 3: انتظار (Processing) */
                        <div style={{ ...styles.statusBadge, color: '#F59E0B', backgroundColor: '#FFFBEB' }}>
                          <Clock size={16} />
                          <span style={{ fontSize: '12px', fontWeight: '500' }}>Processing</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <div style={{textAlign: 'center', marginTop: '50px'}}>
            <UserCircle size={80} color={mainColor} />
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
        )}
      </main>

      {selectedOffer && (
        <div style={styles.modalOverlay} onClick={() => setSelectedOffer(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>{selectedOffer.title}</h3>
            <p>{selectedOffer.description}</p>
            <button onClick={() => applyToOffer(selectedOffer.id)} style={{...styles.fullApplyBtn, backgroundColor: mainColor}}>Confirm Application</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', direction: 'ltr' },
    sidebar: { width: '100px', backgroundColor: '#fff', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '25px 0', position: 'fixed', height: '100vh', zIndex: 10 },
    logoSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '5px' },
    logoIcon: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' },
    logoText: { fontSize: '12px', fontWeight: '700', color: '#1e293b' },
    navStack: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
    navLink: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' },
    activeNavLink: { color: '#82CAFF', backgroundColor: '#f0f9ff' },
    exitBtn: { border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', marginBottom: '20px', transition: 'transform 0.2s' },
    mainContent: { flex: 1, marginLeft: '100px', padding: '40px 60px' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'flex-start' },
    searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 18px', borderRadius: '14px', width: '350px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    searchField: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px' },
    offersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'flex-start' },
    cardTitle: { fontSize: '17px', margin: 0, fontWeight: '600', color: '#1e293b' },
    cardText: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
    cardFooter: { marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#82CAFF', fontWeight: '500' },
    listStack: { display: 'flex', flexDirection: 'column', gap: '15px' },
    appCard: { backgroundColor: '#fff', padding: '20px 30px', borderRadius: '18px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    cardInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
    downloadBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background 0.2s' },
    statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    fullApplyBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', marginTop: '25px', fontWeight: '700', fontSize: '15px' }
};

export default StudentDashboard;