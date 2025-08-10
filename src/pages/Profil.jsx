import React, { useEffect, useState } from 'react';
import UserService from '../services/userService';
import { Calendar, Mail, User, Award, Target, TrendingUp, Star, Clock, Edit3, Settings, BarChart3, Users, Activity, Lock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../css/Profil.css';

function Profil({ totalSurveyCount = 10 }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalSurveys: 0,
    completedSurveys: 0,
    averageRating: 0,
    joinDate: null,
    lastActivity: null,
    badges: []
  });
  const { slug: routeSlug } = useParams();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    const idToLoad = !routeSlug ? (savedUser && savedUser.id) : null;
    if (routeSlug) {
      fetchUserBySlug(routeSlug, savedUser);
    } else if (idToLoad) {
      fetchUser(idToLoad);
    } else {
      setLoading(false);
    }
  }, [routeSlug]);

  const fetchUser = async (id) => {
    try {
      setLoading(true);
      const users = await UserService.getAllUsers();
      const foundUser = users.find(u => u.id === id);
      setUser(foundUser);
      calculateUserStats(foundUser);
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeSlug = (name) => {
    if (!name) return '';
    return String(name).trim().replace(/\s+/g, '.');
  };

  const fetchUserBySlug = async (slug, viewerUser) => {
    try {
      setLoading(true);
      const users = await UserService.getAllUsers();
      const candidate = users.find(u => normalizeSlug(u.name) === slug);
      setUser(candidate || null);
      if (candidate) calculateUserStats(candidate);
    } catch (error) {
      console.error('Profil slug ile yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (userData) => {
    if (!userData) return;
    
    const completedCount = userData.completesurvey || 0;
    const joinDate = userData.createdAt;
    const badges = calculateBadges(completedCount);
    
    setUserStats({
      totalSurveys: totalSurveyCount,
      completedSurveys: completedCount,
      averageRating: userData.averageRating || 4.2,
      joinDate,
      lastActivity: userData.lastActivity || new Date(),
      badges
    });
  };

  const calculateBadges = (completedCount) => {
    const badges = [];
    if (completedCount >= 1) badges.push({ name: 'İlk Adım', icon: '🎯', description: 'İlk anketini tamamladın' });
    if (completedCount >= 5) badges.push({ name: 'Aktif Katılımcı', icon: '⚡', description: '5 anket tamamladın' });
    if (completedCount >= 10) badges.push({ name: 'Anket Uzmanı', icon: '🏆', description: '10 anket tamamladın' });
    if (completedCount >= 25) badges.push({ name: 'Süper Katılımcı', icon: '🌟', description: '25 anket tamamladın' });
    return badges;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Bilinmiyor';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR');
  };

  const getCompletionPercentage = () => {
    return userStats.totalSurveys > 0 
      ? Math.round((userStats.completedSurveys / userStats.totalSurveys) * 100) 
      : 0;
  };

  const getActivityLevel = () => {
    const completionRate = getCompletionPercentage();
    if (completionRate >= 80) return { level: 'Çok Aktif', color: '#10b981', icon: '🔥' };
    if (completionRate >= 50) return { level: 'Aktif', color: '#3b82f6', icon: '⚡' };
    if (completionRate >= 20) return { level: 'Orta', color: '#f59e0b', icon: '📈' };
    return { level: 'Yeni', color: '#8b5cf6', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className="profil-bg">
        <div className="profil-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Profil yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profil-bg">
        <div className="profil-container">
          <div className="error-message">
            <User size={48} />
            <h3>Kullanıcı bilgisi bulunamadı</h3>
            <p>Lütfen tekrar giriş yapmayı deneyin</p>
          </div>
        </div>
      </div>
    );
  }

  const isPublicView = !!routeSlug;


  const requireAuth = user?.privacySettings?.profileVisibility === 'users' || user?.privacySettings?.profileVisibility === 'private';
  const isOwnProfile = !isPublicView;
  if (isPublicView && user) {
    const visibility = user?.privacySettings?.profileVisibility || 'public';
    if (visibility === 'private') {
      return (
        <div className="profil-bg">
          <div className="profil-container">
            <div className="error-message">
              <Lock size={48} />
              <h3>Bu profil gizli</h3>
              <p>Sahibi bu profili gizli yapmış.</p>
            </div>
          </div>
        </div>
      );
    }
    if (visibility === 'users') {
      const viewer = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
      if (!viewer) {
        return (
          <div className="profil-bg">
            <div className="profil-container">
              <div className="error-message">
                <User size={48} />
                <h3>Bu profili görmek için giriş yapmalısınız</h3>
              </div>
            </div>
          </div>
        );
      }
    }
  }

  const activity = getActivityLevel();

  return (
    <>
      <Header />
      <div className="profil-bg">
        <div className="profil-container">

          <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={40} />
            </div>
            <div className="avatar-status" style={{ backgroundColor: activity.color }}>
              {activity.icon}
            </div>
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-status">
              <span className="status-badge" style={{ backgroundColor: activity.color }}>
                {activity.level}
              </span>
              <span className="join-date">
                <Calendar size={14} />
                {formatDate(userStats.joinDate)} tarihinde katıldı
              </span>
            </div>
          </div>
          {!isPublicView && (
            <div className="profile-actions">
              <Link to="/ayarlar" className="action-btn primary">
                <Edit3 size={16} />
                Düzenle
              </Link>
              <Link to="/ayarlar" className="action-btn secondary">
                <Settings size={16} />
              </Link>
            </div>
          )}
        </div>


        {!loading && user?.id && (
          <div className="share-profile" style={{marginTop:16, display:'flex', alignItems:'center', gap:8, color:'#94a3b8'}}>
            <span>Profil bağlantısı:</span>
            <a href={`/profil/${normalizeSlug(user.name)}`} style={{color:'#60a5fa'}}>mysticsurvey.com/profil/{normalizeSlug(user.name)}</a>
          </div>
        )}


        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon completed">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <h3>{userStats.completedSurveys}</h3>
              <p>Tamamlanan Anket</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon progress">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>%{getCompletionPercentage()}</h3>
              <p>Tamamlama Oranı</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon rating">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>{userStats.averageRating.toFixed(1)}</h3>
              <p>Ortalama Puan</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon activity">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>{userStats.totalSurveys}</h3>
              <p>Toplam Anket</p>
            </div>
          </div>
        </div>


        <div className="progress-section">
          <div className="section-header">
            <h2>İlerleme Durumu</h2>
            <span className="progress-percentage">%{getCompletionPercentage()}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <div className="progress-details">
            <span>{userStats.completedSurveys} / {userStats.totalSurveys} anket tamamlandı</span>
            <span>{userStats.totalSurveys - userStats.completedSurveys} anket kaldı</span>
          </div>
        </div>


        {userStats.badges.length > 0 && (
          <div className="achievements-section">
            <div className="section-header">
              <h2>Başarılar</h2>
              <span className="achievement-count">{userStats.badges.length} rozet</span>
            </div>
            <div className="badges-grid">
              {userStats.badges.map((badge, index) => (
                <div key={index} className="badge-card">
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="activity-section">
          <div className="section-header">
            <h2>Son Aktivite</h2>
            <Clock size={18} />
          </div>
          <div className="activity-card">
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p>Son anket tamamlandı</p>
                <span>{formatDate(userStats.lastActivity)}</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot"></div>
              <div className="activity-content">
                <p>Profil güncellendi</p>
                <span>{formatDate(userStats.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    <Footer />
    </>
  );
}

export default Profil;
