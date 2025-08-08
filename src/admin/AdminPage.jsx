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
  X
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
import { collection, getDocs } from 'firebase/firestore';

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
  analytics: { showAnswers: true, showResults: true, showUserEmails: true, maxItems: 100 }
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
          <SettingsTab settings={settings} onSave={handleSaveSettings} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`dashboard ${settings.uiDensity === 'compact' ? 'density-compact' : ''}`}>

      <div className="sidebar">
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
            <button onClick={() => handleTabClick("settings")} className={`nav-item ${activeTab==='settings' ? 'active' : ''}`}>
              <Settings size={18} />
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <a href="#" className="nav-item">
            <Sun size={18} />
            <span>Light Mode</span>
          </a>
          <a href="#" className="nav-item">
            <User size={18} />
            <span>Admin Profile</span>
          </a>
        </div>
      </div>


      <div className="main-content">

        <header className="header admin-header">
          <div className="header-left">
            <div className="menu-toggle">☰</div>
            <span className="breadcrumb">Home</span>
          </div>
          <div className="header-right">
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
            <button className="header-btn" onClick={() => setShowFilterPanel(prev => !prev)}>
              <Filter size={16} />
              Filter
            </button>
            <button className="header-btn" onClick={handleExport}>
              <Download size={16} />
              Export
            </button>
            <button className="header-btn" onClick={handleRefresh}>
              <RefreshCw size={16} />
              Refresh
            </button>

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
      </div>
    </div>
  );
};

export default AdminPage;