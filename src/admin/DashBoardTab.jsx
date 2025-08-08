import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart3,
  Users as UsersIcon,
  Activity,
  Eye,
  Calendar,
  Plus,
  Settings as SettingsIcon,
  FileText,
  Folder,
  RefreshCw,
} from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export default function DashboardTab({ settings = {}, onNavigate = () => {}, onNotify = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [categories, setCategories] = useState([]);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !!u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.active).length;

  const recentUsers = useMemo(() => users.slice(0, 5), [users]);

  const load = async () => {
    try {
      setLoading(true);
      const [usersSnap, surveysSnap, categoriesSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'))),
        getDocs(query(collection(db, 'surveys'))),
        getDocs(query(collection(db, 'categories'))),
      ]);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSurveys(surveysSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCategories(categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Dashboard load error', e);
      onNotify('database', { type: 'error', title: 'Kontrol Paneli', message: 'Veriler yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const navigateToUsers = () => onNavigate('users');
  const navigateToSurveys = () => onNavigate('surveys');
  const navigateToDatabase = () => onNavigate('database');
  const navigateToSettings = () => onNavigate('settings');

  return (
    <>
      <div className="welcome-section">
        <h1>Kontrol Paneli</h1>
        <p>Platform özetine ve hızlı işlemlere buradan ulaşın</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <UsersIcon size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalUsers}</div>
            <div className="stat-label">Toplam Kullanıcı</div>
            <div className="progress-bar">
              <div className="progress-fill blue" style={{width: totalUsers > 0 ? '100%' : '0%'}}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{activeUsers}</div>
            <div className="stat-label">Aktif Kullanıcı</div>
            <div className="progress-bar">
              <div className="progress-fill green" style={{width: totalUsers > 0 ? `${(activeUsers/totalUsers)*100}%` : '0%'}}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalSurveys}</div>
            <div className="stat-label">Toplam Anket</div>
            <div className="progress-bar">
              <div className="progress-fill orange" style={{width: totalSurveys > 0 ? '100%' : '0%'}}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{activeSurveys}</div>
            <div className="stat-label">Aktif Anket</div>
            <div className="progress-bar">
              <div className="progress-fill purple" style={{width: totalSurveys > 0 ? `${(activeSurveys/totalSurveys)*100}%` : '0%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        <div className="analytics-card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} />
              Genel Durum
            </div>
            <div className="card-subtitle">Kısa özet</div>
          </div>
          <div className="time-selector">
            <Calendar size={16} />
            Şu anki toplam değerler
          </div>
          <div className="chart-container">
            <div className="chart-stats">
              <div className="chart-stat">
                <div className="stat-value green">{activeUsers}/{totalUsers}</div>
                <div className="stat-description">Aktif/T. Kullanıcı</div>
              </div>
              <div className="chart-stat">
                <div className="stat-value purple">{activeSurveys}/{totalSurveys}</div>
                <div className="stat-description">Aktif/T. Anket</div>
              </div>
              <div className="chart-stat">
                <div className="stat-value">{categories.length}</div>
                <div className="stat-description">Kategori</div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="quick-actions">
            <h3>Hızlı İşlemler</h3>
            <div className="action-list">
              <button className="action-item" onClick={navigateToUsers}>
                <UsersIcon size={16} />
                <span>Kullanıcıları Yönet</span>
                <span className="shortcut">U</span>
              </button>
              <button className="action-item" onClick={navigateToSurveys}>
                <FileText size={16} />
                <span>Anketleri Yönet</span>
                <span className="shortcut">S</span>
              </button>
              <button className="action-item" onClick={navigateToDatabase}>
                <Folder size={16} />
                <span>Database</span>
                <span className="shortcut">D</span>
              </button>
              <button className="action-item" onClick={navigateToSettings}>
                <SettingsIcon size={16} />
                <span>Ayarlar</span>
                <span className="shortcut">G</span>
              </button>
            </div>
          </div>

          <div className="system-status">
            <h3>Son Üyeler</h3>
            <div className="status-list">
              {loading && <div className="status-item"><span>Yükleniyor...</span></div>}
              {!loading && recentUsers.length === 0 && (
                <div className="status-item"><span>Kayıt yok</span></div>
              )}
              {!loading && recentUsers.map(u => (
                <div key={u.id} className="status-item" style={{justifyContent:'space-between'}}>
                  <span style={{color:'#fff'}}>{u.name || 'İsimsiz'}</span>
                  <span className="status-value">{u.role || 'user'}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:12, display:'flex', gap:8}}>
              <button className="add-user-btn" onClick={navigateToUsers}>
                <Plus size={16} /> Kullanıcı Ekle
              </button>
              <button className="add-user-btn" onClick={load}>
                <RefreshCw size={16} /> Yenile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}