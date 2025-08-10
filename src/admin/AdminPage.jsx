import React, {useState, useMemo, useEffect} from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Bell,
  BarChart3,
  Users,
  Activity,
  Settings,
  Database as DbIcon,
  Sun,
  User,
  X,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import '../css/AdminPage.css';
import UsersTab from "./UsersTab";
import SurveysTab from "./SurveysTab";
import DashboardTab from "./DashBoardTab";
import DatabaseTab from "./DatabaseTab";
import SettingsTab from "./SettingsTab";
import AnalyticsTab from "./AnalyticsTab";
import UserService from "../services/userService";
import { db } from "../services/firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { listFeedback } from '../services/feedbackService.js';
import { addNotification } from '../services/notificationService.js';

const DEFAULT_SETTINGS = {
  siteTitle: 'Mystic Survey',
  showContactLink: true,
  defaultAdminTab: 'dashboard',
  surveysDefaultSubTab: 'list',
  databaseDefaultTab: null,
  notifications: { users: true, surveys: true, database: true, export: true, refresh: true, analytics: true, maxItems: 50, autoClearMs: 0 },
  uiDensity: 'comfortable',
  export: { delimiter: ',', includeHeaders: true, filenamePrefix: 'export' },
  autoRefreshSec: 0,
  confirmations: { delete: true },
  surveys: { defaultQuestionCount: 1, defaultActive: true, showTopBars: true },
  header: { hideOnScroll: true },
  analytics: { showAnswers: true, showResults: true, showUserEmails: true, maxItems: 100 },
  passwordPolicy: { enabled: false, minLength: 8, requireLower: true, requireUpper: true, requireDigit: true },
  theme: 'dark',
  headerControls: { search: true, filter: true, export: true, refresh: true },
  sidebarWidth: 'normal',
  accentColor: '#3b82f6',
  footer: { shimmer: true },
  contactEmail: 'destek@mysticsurvey.com',
  supportPhone: '',
  home: { heroTitle: 'Mystic Survey', heroSubtitle: 'Modern anket deneyimi' },
  profiles: { allowPublic: true, slugSeparator: '.' }
};

const loadSettings = () => {
  try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem('appSettings')) || {}) }; }
  catch { return DEFAULT_SETTINGS; }
};

const saveSettings = (s) => { localStorage.setItem('appSettings', JSON.stringify(s)); };

const AdminPage = () => {
  const [settings, setSettings] = useState(loadSettings());
  const [activeTab, setActiveTab] = useState(loadSettings().defaultAdminTab || "dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [onlyActive, setOnlyActive] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshToken, setRefreshToken] = useState(0);
  const [surveysSubTab, setSurveysSubTab] = useState(loadSettings().surveysDefaultSubTab || 'list');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminProfile')) || { name: 'Admin', email: 'admin@example.com', phone: '' }; }
    catch { return { name: 'Admin', email: 'admin@example.com', phone: '' }; }
  });

  const [systemPrefersLight, setSystemPrefersLight] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const [feedback, setFeedback] = useState([]);


  useEffect(() => {
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    if (!mq) return;
    const handler = (e) => setSystemPrefersLight(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler); };
  }, []);


  const effectiveTheme = useMemo(() => {
    const t = settings.theme || 'dark';
    if (t === 'system') return systemPrefersLight ? 'light' : 'dark';
    return t;
  }, [settings.theme, systemPrefersLight]);
 
  useEffect(() => {
    if (activeTab === 'feedback') {
      (async () => { try { setFeedback(await listFeedback()); } catch (e) { console.error('Feedback yüklenemedi', e); } })();
    }
  }, [activeTab, refreshToken]);

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'appSettings') setSettings(loadSettings()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);


  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);

    setSearchQuery("");
    setShowFilterPanel(false);
    setOnlyActive(false);
    setRoleFilter("all");
    if (tabName !== 'surveys') setSurveysSubTab(settings.surveysDefaultSubTab || 'list');
  };

  const headerFilters = useMemo(() => ({ onlyActive, role: roleFilter }), [onlyActive, roleFilter]);

  const pushNotification = ({ type = 'info', title = 'Bildirim', message = '' }) => {
    const n = { id: Math.random().toString(36).slice(2), type, title, message, time: new Date() };
    const maxItems = settings.notifications?.maxItems ?? 50;
    setNotifications(prev => [n, ...prev].slice(0, maxItems));
    setUnreadCount(c => c + 1);
    const autoMs = settings.notifications?.autoClearMs || 0;
    if (autoMs > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(x => x.id !== n.id));
      }, autoMs);
    }
  };

  const notify = (domain, payload) => {
    const map = settings.notifications || {};
    if (map[domain]) pushNotification(payload);
  };

  const handleExport = async () => {
    try {
      const delimiter = settings.export?.delimiter || ',';
      const includeHeaders = settings.export?.includeHeaders !== false;
      const filenamePrefix = settings.export?.filenamePrefix || 'export';

      if (activeTab === "users") {
        const allUsers = await UserService.getAllUsers();
        const filtered = allUsers.filter(u => {
          const matchSearch = !searchQuery
            || u.name?.toLowerCase().includes(searchQuery.toLowerCase())
            || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchRole = roleFilter === 'all' || (u.role || 'user') === roleFilter;
          const matchActive = !onlyActive || !!u.isActive;
          return matchSearch && matchRole && matchActive;
        });
        const headers = ["id","name","email","phone","role","isActive","createdAt"];
        const rows = [
          ...(includeHeaders ? [headers] : []),
          ...filtered.map(u => [
            u.id || "",
            u.name || "",
            u.email || "",
            u.phone || "",
            u.role || "user",
            String(!!u.isActive),
            u.createdAt ? (u.createdAt.toDate ? u.createdAt.toDate().toISOString() : new Date(u.createdAt).toISOString()) : ""
          ])
        ];
        const csv = rows.map(r => r.map(field => `"${String(field).replaceAll('"','""')}"`).join(delimiter)).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filenamePrefix}_users.csv`;
        a.click();
        URL.revokeObjectURL(url);
        notify('export', { type: 'success', title: 'Dışa Aktarım', message: `Kullanıcılar CSV olarak indirildi (${filtered.length} satır)` });
        return;
      }

      if (activeTab === 'surveys') {
        const snap = await getDocs(collection(db, 'surveys'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filtered = all.filter(s => {
          const matchSearch = !searchQuery
            || s.title?.toLowerCase().includes(searchQuery.toLowerCase())
            || s.description?.toLowerCase().includes(searchQuery.toLowerCase())
            || s.category?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchActive = !onlyActive || !!s.active;
          return matchSearch && matchActive;
        });
        const headers = ["id","title","category","questionCount","active","createdAt"];
        const rows = [
          ...(includeHeaders ? [headers] : []),
          ...filtered.map(s => [
            s.id,
            s.title || '',
            s.category || '',
            s.questionCount || 0,
            String(!!s.active),
            s.createdAt || ''
          ])
        ];
        const csv = rows.map(r => r.map(field => `"${String(field).replaceAll('"','""')}"`).join(delimiter)).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filenamePrefix}_surveys.csv`;
        a.click();
        URL.revokeObjectURL(url);
        notify('export', { type: 'success', title: 'Dışa Aktarım', message: `Anketler CSV olarak indirildi (${filtered.length} satır)` });
        return;
      }

      if (activeTab === 'database') {
        const [usersSnap, surveysSnap, categoriesSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'surveys')),
          getDocs(collection(db, 'categories')),
        ]);
        const makeCsv = (rows) => rows.map(r => r.map(field => `"${String(field).replaceAll('"','""')}"`).join(delimiter)).join('\n');
        const download = (name, rows) => {
          const csv = makeCsv(rows);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `${filenamePrefix}_${name}.csv`; a.click(); URL.revokeObjectURL(url);
        };
        const uRows = [["id","name","email","role","isActive"], ...usersSnap.docs.map(d => { const u=d.data(); return [d.id, u.name||'', u.email||'', u.role||'user', String(!!u.isActive)]; })];
        const sRows = [["id","title","category","active"], ...surveysSnap.docs.map(d => { const s=d.data(); return [d.id, s.title||'', s.category||'', String(!!s.active)]; })];
        const cRows = [["id","name"], ...categoriesSnap.docs.map(d => { const c=d.data(); return [d.id, c.name||'']; })];
        if (includeHeaders) { download('users', uRows); download('surveys', sRows); download('categories', cRows); }
        else { download('users', uRows.slice(1)); download('surveys', sRows.slice(1)); download('categories', cRows.slice(1)); }
        notify('export', { type: 'success', title: 'Dışa Aktarım', message: 'Database CSV olarak indirildi (3 dosya)' });
        return;
      }

      if (activeTab === 'analytics') {
        alert('Analiz için dışa aktarma daha sonra eklenecek.');
        notify('export', { type: 'info', title: 'Dışa Aktarım', message: 'Analiz dışa aktarma yakında' });
        return;
      }

      alert('Bu sekme için dışa aktarma henüz uygulanmadı.');
    } catch (e) {
      console.error('Export error:', e);
      alert('Dışa aktarma sırasında bir hata oluştu');
      notify('export', { type: 'error', title: 'Dışa Aktarım', message: 'Dışa aktarma başarısız' });
    }
  };

  const handleRefresh = () => {
    setRefreshToken(prev => prev + 1);
    notify('refresh', { type: 'info', title: 'Yenileme', message: 'İçerik yenilendi' });
  };


  useEffect(() => {
    const sec = Number(settings.autoRefreshSec) || 0;
    if (sec <= 0) return;
    const id = setInterval(() => setRefreshToken(prev => prev + 1), sec * 1000);
    return () => clearInterval(id);
  }, [settings.autoRefreshSec, activeTab]);

  const handleSaveSettings = (next) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    saveSettings(merged);
    notify('database', { type: 'success', title: 'Ayarlar', message: 'Ayarlar kaydedildi' });
  };

  const applyPreviewSettings = (next) => {

    setSettings(next);
  };

  const toggleTheme = () => {
    const next = settings.theme === 'light' ? 'dark' : 'light';
    handleSaveSettings({ theme: next });
    notify('database', { type: 'info', title: 'Tema', message: `Tema ${next === 'light' ? 'Açık' : 'Koyu'} olarak ayarlandı` });
  };

  const saveProfile = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || 'null');
      if (stored?.id) {
        await updateDoc(doc(db, 'users', stored.id), { name: profile.name, email: profile.email, phone: profile.phone || '' });

        const updated = { ...stored, name: profile.name, email: profile.email };
        localStorage.setItem('userInfo', JSON.stringify(updated));
      }
    } catch { /* ignore */ }
    localStorage.setItem('adminProfile', JSON.stringify(profile));
    setShowProfile(false);
    notify('users', { type: 'success', title: 'Profil', message: 'Profil güncellendi' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab settings={settings} onNavigate={setActiveTab} onNotify={(domain, p)=>notify(domain, p)} />
        );
      case "users":
        return (
          <UsersTab 
            externalSearch={searchQuery}
            externalFilters={headerFilters}
            refreshToken={refreshToken}
            onNotify={(p)=>notify('users', p)}
            settings={settings}
          />
        );
      case "surveys":
        return (
          <div>
            <div className="subtab-bar">
              <button className={`subtab-btn ${surveysSubTab==='list' ? 'active' : ''}`} onClick={() => setSurveysSubTab('list')}>Anketler</button>
              <button className={`subtab-btn ${surveysSubTab==='create' ? 'active' : ''}`} onClick={() => setSurveysSubTab('create')}>Anket Ekle</button>
              <button className={`subtab-btn ${surveysSubTab==='edit' ? 'active' : ''}`} onClick={() => setSurveysSubTab('edit')}>Anket Düzenle</button>
            </div>
            <SurveysTab mode={surveysSubTab} key={surveysSubTab} onNotify={(p)=>notify('surveys', p)} settings={settings} showTopBars={settings.surveys?.showTopBars !== false} externalSearch={searchQuery} externalFilters={headerFilters} refreshToken={refreshToken} />
          </div>
        );
      case "database":
        return <DatabaseTab onNotify={(p)=>notify('database', p)} defaultActiveTab={settings.databaseDefaultTab ?? null} settings={settings} externalSearch={searchQuery} refreshToken={refreshToken} />
      case "analytics":
        return (
          <AnalyticsTab settings={settings} onNotify={(p)=>notify('analytics', p)} externalSearch={searchQuery} refreshToken={refreshToken} />
        );
      case "settings":
        return (
          <SettingsTab settings={settings} onSave={handleSaveSettings} onLiveChange={applyPreviewSettings} />
        );
      case "notify":
        return (
          <div className="tab-content">
            <div className="users-header" style={{paddingLeft:0,paddingRight:0, marginBottom:16}}>
              <div className="header-left"><div><h2>Bildirim Gönder</h2><p>Kullanıcılara bildirim iletin</p></div></div>
            </div>
            <NotifyForm />
          </div>
        );
      case "feedback":
        return (
          <div className="tab-content">
            <div className="users-header" style={{paddingLeft:0,paddingRight:0, marginBottom:16}}>
              <div className="header-left"><div><h2>Geri Bildirimler</h2><p>Kullanıcıların ilettiği mesajlar</p></div></div>
            </div>
            <div className="table" style={{display:'grid', gap:8}}>
              {feedback.map(f => (
                <div key={f.id} className="row" style={{display:'grid', gridTemplateColumns:'1fr 2fr 3fr 100px', gap:12, alignItems:'center', background:'rgba(16,24,40,0.35)', border:'1px solid rgba(148,163,184,0.18)', borderRadius:12, padding:12}}>
                  <div style={{color:'#e2e8f0'}}>{f.name || 'Anonim'}<div style={{color:'#94a3b8', fontSize:12}}>{f.email || '-'}</div></div>
                  <div style={{color:'#cbd5e1'}}>{f.subject || '-'}</div>
                  <div style={{color:'#94a3b8'}}>{f.message}</div>
                  <div style={{textAlign:'right', color:'#fbbf24', fontWeight:700}}>{f.rating ? `${f.rating}/5` : '-'}</div>
                </div>
              ))}
              {feedback.length===0 && <div style={{color:'#94a3b8'}}>Henüz geri bildirim bulunmuyor</div>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`dashboard ${settings.uiDensity === 'compact' ? 'density-compact' : ''} ${effectiveTheme === 'light' ? 'theme-light' : ''}`}>

      <div className={`sidebar ${settings.sidebarWidth === 'wide' ? 'sidebar-wide' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">TC</div>
            <div className="logo-text">
              <div className="company-name">TechCorp</div>
              <div className="panel-name">Admin Panel</div>
            </div>
          </div>
        </div>

        <div className="navigation">
          <div className="nav-title">Navigation</div>
          <nav className="nav-menu">
            <button onClick={() => handleTabClick("dashboard")} className={`nav-item ${activeTab==='dashboard' ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Kontrol Paneli</span>
            </button>
            <button onClick={() => handleTabClick("analytics")} className={`nav-item ${activeTab==='analytics' ? 'active' : ''}`}>
              <Activity size={18} />
              <span>Analiz</span>
            </button>
            <button onClick={() => handleTabClick("users")} className={`nav-item ${activeTab==='users' ? 'active' : ''}`}>
              <Users size={18} />
              <span>Kullanıcılar</span>
            </button>
            <button onClick={() => handleTabClick("surveys")} className={`nav-item ${activeTab==='surveys' ? 'active' : ''}`}>
              <div className="content-icon">📄</div>
              <span>Anketler</span>
            </button>
            <button onClick={() => handleTabClick("database")} className={`nav-item ${activeTab==='database' ? 'active' : ''}`}>
              <DbIcon size={18} />
              <span>Database</span>
            </button>
            <button onClick={() => handleTabClick("notify")} className={`nav-item ${activeTab==='notify' ? 'active' : ''}`}>
              <Bell size={18} />
              <span>Bildirim</span>
            </button>
            <button onClick={() => handleTabClick("feedback")} className={`nav-item ${activeTab==='feedback' ? 'active' : ''}`}>
              <MessageSquare size={18} />
              <span>Geri Bildirim</span>
            </button>
            <button onClick={() => handleTabClick("settings")} className={`nav-item ${activeTab==='settings' ? 'active' : ''}`}>
              <Settings size={18} />
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={toggleTheme}>
            <Sun size={18} />
            <span>{effectiveTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className="nav-item" onClick={async () => {
            // Load current admin from storage and Firestore
            try {
              const stored = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || 'null');
              if (stored?.id) {
                const snap = await getDoc(doc(db, 'users', stored.id));
                if (snap.exists()) {
                  const u = snap.data();
                  setProfile({ name: u.name || stored.name || 'Admin', email: u.email || stored.email || '', phone: u.phone || '' });
                } else {
                  setProfile({ name: stored.name || 'Admin', email: stored.email || '', phone: '' });
                }
              }
            } catch { /* ignore */ }
            setShowProfile(true);
          }}>
            <User size={18} />
            <span>Admin Profile</span>
          </button>
        </div>
      </div>


      <div className="main-content">

        <header className="header admin-header">
          <div className="header-left">
            <div className="menu-toggle">☰</div>
            <span className="breadcrumb">Home</span>
          </div>
          <div className="header-right">
            {settings.headerControls?.search !== false && (
            <div className="search-container">
              <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            )}
            {settings.headerControls?.filter !== false && (
              <button className="header-btn" onClick={() => setShowFilterPanel(prev => !prev)}>
              <Filter size={16} />
              Filter
            </button>
            )}
            {settings.headerControls?.export !== false && (
              <button className="header-btn" onClick={handleExport}>
              <Download size={16} />
              Export
            </button>
            )}
            {settings.headerControls?.refresh !== false && (
              <button className="header-btn" onClick={handleRefresh}>
              <RefreshCw size={16} />
              Refresh
            </button>
            )}
            
            <div className="notif-container">
              <button className="notification-btn" title="Notifications" onClick={() => { setShowNotif(v => { const nv = !v; if (!v) setUnreadCount(0); return nv; }); }}>
              <Bell size={16} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
              {showNotif && (
                <div className="notif-panel" onClick={(e)=>e.stopPropagation()}>
                  <div className="notif-header">
                    <span>Bildirimler</span>
                    <button className="notif-clear" onClick={() => setNotifications([])}>Temizle</button>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">Şu anda bildirim yok</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`notif-item notif-${n.type}`}>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{new Date(n.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {showFilterPanel && (
          <div className="filter-panel">
            <div className="filter-row">
              {activeTab === 'users' ? (
                <>
                  <label className="filter-item checkbox">
                    <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                    <span>Sadece aktif kullanıcılar</span>
                  </label>
                  <label className="filter-item">
                    Rol:
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                      <option value="all">Tümü</option>
                      <option value="admin">Admin</option>
                      <option value="user">Kullanıcı</option>
                    </select>
                  </label>
                </>
              ) : activeTab === 'surveys' ? (
                <>
                  <label className="filter-item checkbox">
                    <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
                    <span>Sadece aktif anketler</span>
                  </label>
                  <div className="filter-item" style={{color:'#9ca3af'}}>Kategori filtresi için üstteki anket barını kullanın</div>
                </>
              ) : (
                <div className="filter-item">Bu sekme için ek filtre yok</div>
              )}
              <button className="filter-close" onClick={() => setShowFilterPanel(false)}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}


        <div className="dashboard-content" onClick={() => setShowNotif(false)}>
          {renderContent()}
        </div>
        {showProfile && (
          <div className="profile-overlay" onClick={() => setShowProfile(false)}>
            <div className="profile-modal" onClick={(e)=>e.stopPropagation()}>
              <div className="profile-header">
                <h3>Admin Profili</h3>
                <button className="profile-close" onClick={()=>setShowProfile(false)}>×</button>
              </div>
              <div className="profile-body">
                <label>Ad Soyad</label>
                <input type="text" value={profile.name} onChange={(e)=>setProfile(p=>({...p, name: e.target.value}))} />
                <label>Email</label>
                <input type="email" value={profile.email} onChange={(e)=>setProfile(p=>({...p, email: e.target.value}))} />
                <label>Telefon</label>
                <input type="tel" value={profile.phone || ''} onChange={(e)=>setProfile(p=>({...p, phone: e.target.value}))} />
              </div>
              <div className="modal-actions" style={{justifyContent:'flex-end'}}>
                <button className="btn-secondary" onClick={()=>setShowProfile(false)}>İptal</button>
                <button className="btn-primary" onClick={saveProfile}>Kaydet</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NotifyForm = () => {
  const [target, setTarget] = React.useState('all');
  const [userIds, setUserIds] = React.useState([]);
  const [type, setType] = React.useState('info');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => { (async ()=>{
    try { const snap = await getDocs(collection(db,'users')); setUsers(snap.docs.map(d=>({id:d.id, ...d.data()}))); } catch {}
  })(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      if (target === 'all') {
        await addNotification({ target: 'all', type, title, message });
      } else {
        if (!userIds.length) { alert('En az bir kullanıcı seçin'); setSending(false); return; }
        await Promise.all(userIds.map(id => addNotification({ target: id, type, title, message })));
      }
      setTitle(''); setMessage('');
      alert('Bildirim gönderildi');
    } catch (e) {
      console.error('Bildirim gönderilemedi', e);
      alert('Bildirim gönderilemedi');
    } finally { setSending(false); }
  };

  return (
    <form onSubmit={submit} className="settings-form" style={{maxWidth:720}}>
      <div className="form-group">
        <label>Hedef</label>
        <div style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:8}}>
          <select value={target} onChange={(e)=>setTarget(e.target.value)}>
            <option value="all">Tüm Kullanıcılar</option>
            <option value="users">Belirli Kullanıcılar</option>
          </select>
          {target==='users' && (
            <select multiple value={userIds} onChange={(e)=>{
              const values = Array.from(e.target.selectedOptions).map(o=>o.value);
              setUserIds(values);
            }} size={8}>
              {users.map(u => (<option key={u.id} value={u.id}>{u.name || u.email} ({u.id.slice(0,6)})</option>))}
            </select>
          )}
        </div>
        {target==='users' && <small style={{color:'#9ca3af'}}>İpucu: Çoklu seçim için Ctrl/Cmd veya Shift kullanın.</small>}
      </div>
      <div className="form-group">
        <label>Tür</label>
        <select value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="info">Bilgi</option>
          <option value="success">Başarı</option>
          <option value="warning">Uyarı</option>
          <option value="error">Hata</option>
        </select>
      </div>
      <div className="form-group">
        <label>Başlık</label>
        <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Başlık" />
      </div>
      <div className="form-group">
        <label>Mesaj</label>
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} placeholder="Mesaj"></textarea>
      </div>
      <div className="modal-actions" style={{justifyContent:'flex-end'}}>
        <button type="submit" className="btn-primary" disabled={sending}>{sending ? 'Gönderiliyor...' : 'Gönder'}</button>
      </div>
    </form>
  );
};

export default AdminPage;