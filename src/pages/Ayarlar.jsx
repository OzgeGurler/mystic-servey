
import React, { useState, useEffect } from "react";
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { User, Mail, Lock, Phone, Eye, EyeOff, Save, Camera, Shield, Bell, Globe, Trash2, Download, Upload } from 'lucide-react';
import UserService from '../services/userService';
import "../css/Ayarlar.css";
import storageService from '../services/storageService.js';
import AlertPopup from '../components/AlertPopup.jsx';

function Ayarlar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    emailVisible: false,
    phoneVisible: false,
    activityVisible: true,
    surveysVisible: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    surveyReminders: true,
    newSurveyAlerts: false
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userInfo")) || JSON.parse(sessionStorage.getItem("userInfo"));
    if (savedUser && savedUser.id) {
      fetchUser(savedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (id) => {
    try {
      setLoading(true);
      const users = await UserService.getAllUsers();
      const foundUser = users.find(u => u.id === id);
      
      if (foundUser) {
        setUser(foundUser);
        setFormData({
          name: foundUser.name || '',
          email: foundUser.email || '',
          phone: foundUser.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        

        const savedPrivacy = foundUser.privacySettings || JSON.parse(localStorage.getItem('privacySettings')) || privacySettings;
        const savedNotifications = foundUser.notificationSettings || JSON.parse(localStorage.getItem('notificationSettings')) || notificationSettings;
        setPrivacySettings(savedPrivacy);
        setNotificationSettings(savedNotifications);
      }
    } catch (error) {
      console.error("Kullanıcı bilgisi alınamadı:", error);
      setMessage("Kullanıcı bilgileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePrivacyChange = (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    localStorage.setItem('privacySettings', JSON.stringify(newSettings));
  };

  const handleNotificationChange = (key) => {
    const newSettings = { 
      ...notificationSettings, 
      [key]: !notificationSettings[key] 
    };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));

    if (key === 'pushNotifications' && newSettings.pushNotifications) {
      try {
        if ('Notification' in window) {
          Notification.requestPermission().then((perm)=>{
            if (perm !== 'granted') {
              setMessage('Tarayıcı bildirim izni verilmedi');
              setTimeout(()=>setMessage(''),1500);
              setNotificationSettings(prev=>({ ...prev, pushNotifications: false }));
              localStorage.setItem('notificationSettings', JSON.stringify({ ...newSettings, pushNotifications: false }));
            } else {
              try { new Notification('Bildirimler etkin',''); } catch {}
            }
          });
        }
      } catch {}
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gereklidir';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ad Soyad en az 2 karakter olmalıdır';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    

    if (formData.newPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Mevcut şifrenizi girin';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Yeni şifre gereklidir';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Şifre en az 6 karakter olmalıdır';
      }
      
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Şifreler eşleşmiyor';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaveLoading(true);
    
    try {

      if (formData.newPassword) {
        if (user.password !== formData.currentPassword) {
          setErrors({ currentPassword: 'Mevcut şifre hatalı' });
          setSaveLoading(false);
      return;
    }
      }
      

      if (formData.email !== user.email) {
        const users = await UserService.getAllUsers();
        const emailExists = users.some(u => 
          u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== user.id
        );
        
        if (emailExists) {
          setErrors({ email: 'Bu e-posta adresi zaten kullanılıyor' });
          setSaveLoading(false);
          return;
        }
      }
      

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim()
      };
      
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }


      if (profilePhoto) {
        try {
          const url = await storageService.uploadProfilePhoto(user.id, profilePhoto);
          updateData.photoURL = url;
        } catch (err) {
          console.error('Fotoğraf yüklenemedi', err);
        }
      }
      

      await UserService.updateUser(user.id, {
        ...updateData,
        privacySettings,
        notificationSettings
      });
      

      const updatedUser = { ...user, ...updateData, privacySettings, notificationSettings };
      setUser(updatedUser);
      

      const isLocalStorage = localStorage.getItem('userInfo');
      const storageType = isLocalStorage ? localStorage : sessionStorage;
      const currentUserInfo = JSON.parse(storageType.getItem('userInfo'));
      const updatedUserInfo = { ...currentUserInfo, ...updateData };
      storageType.setItem('userInfo', JSON.stringify(updatedUserInfo));
      

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
      setMessage("Profil başarıyla güncellendi!");
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setMessage("Güncelleme sırasında hata oluştu.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      (async () => {
        try {
          await UserService.deleteUser(user.id);
          localStorage.removeItem('userInfo');
          sessionStorage.removeItem('userInfo');
          setUser(null);
          setMessage('Hesabınız silindi');
          setTimeout(()=>{ window.location.href = '/'; }, 1000);
        } catch (e) {
          console.error('Hesap silinemedi', e);
          setMessage('Hesap silinirken hata oluştu');
          setTimeout(()=>setMessage(''),1500);
        }
      })();
    }
  };

  const handleExportData = () => {
    try {
      const exportObject = { 
        id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        privacySettings,
        notificationSettings
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'mystic-survey-user.json'; a.click(); URL.revokeObjectURL(url);
      setMessage('Veriler indirildi');
      setTimeout(()=>setMessage(''),1500);
    } catch (e) {
      setMessage('Veriler indirilemedi');
      setTimeout(()=>setMessage(''),1500);
    }
  };

  if (loading) {
    return (
      <div className="settings-bg">
        <div className="settings-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Ayarlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="settings-bg">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Hesap Ayarları</h1>
          <p>Profil bilgilerinizi ve hesap ayarlarınızı yönetin</p>
        </div>
        <div className="settings-message info">Profil bağlantınız: <a href={`/profil/${(user?.name||'').trim().replace(/\s+/g,'.')}`} style={{color:'#93c5fd'}}>mysticsurvey.com/profil/{(user?.name||'').trim().replace(/\s+/g,'.')}</a></div>

        {message && (
          <AlertPopup 
            type={message.includes('başarı') ? 'success' : 'info'} 
            title={message.includes('başarı') ? 'Başarılı' : 'Bilgi'} 
            message={message}
            onClose={()=>setMessage("")}
          />
        )}

        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Profil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={18} />
            Gizlilik
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            Bildirimler
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} />
            Güvenlik
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Profil Bilgileri</h2>
                <p>Kişisel bilgilerinizi güncelleyin</p>
              </div>

              <div className="profile-photo-section">
                <div className="photo-container">
                  <div className="photo-preview">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <label className="photo-upload-btn">
                    <Camera size={16} />
                    Fotoğraf Değiştir
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      hidden 
                    />
                  </label>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Ad Soyad *</label>
                  <div className="input-container">
                    <User className="input-icon" size={18} />
        <input
          type="text"
                      id="name"
          name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Adınızı ve soyadınızı girin"
                      disabled={saveLoading}
                    />
                  </div>
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-posta *</label>
                  <div className="input-container">
                    <Mail className="input-icon" size={18} />
        <input
          type="email"
                      id="email"
          name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="E-posta adresinizi girin"
                      disabled={saveLoading}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefon</label>
                  <div className="input-container">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Telefon numaranızı girin"
                      disabled={saveLoading}
                    />
                  </div>
                </div>

                <div className="password-section">
                  <h3>Şifre Değiştirme</h3>
                  <p>Şifrenizi değiştirmek isterseniz aşağıdaki alanları doldurun</p>

                  <div className="form-group">
                    <label htmlFor="currentPassword">Mevcut Şifre</label>
                    <div className="input-container">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                        placeholder="Mevcut şifrenizi girin"
                        disabled={saveLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Yeni Şifre</label>
                    <div className="input-container">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`form-input ${errors.newPassword ? 'error' : ''}`}
                        placeholder="Yeni şifrenizi girin"
                        disabled={saveLoading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">Yeni Şifre Tekrar</label>
                    <div className="input-container">
                      <Lock className="input-icon" size={18} />
        <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                        className={`form-input ${errors.confirmNewPassword ? 'error' : ''}`}
                        placeholder="Yeni şifrenizi tekrar girin"
                        disabled={saveLoading}
        />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && <span className="error-text">{errors.confirmNewPassword}</span>}
                  </div>
                </div>

                <button type="submit" className="save-btn" disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>
      </form>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Gizlilik Ayarları</h2>
                <p>Hangi bilgilerinizin görünür olacağını kontrol edin</p>
              </div>

              <div className="privacy-settings">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Profil Görünürlüğü</h4>
                    <p>Profilinizi kimler görebilir</p>
                  </div>
                  <select 
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="setting-select"
                  >
                    <option value="public">Herkese Açık</option>
                    <option value="users">Sadece Üyeler</option>
                    <option value="private">Özel</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>E-posta Görünürlüğü</h4>
                    <p>E-posta adresinizi diğer kullanıcılar görebilir</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={privacySettings.emailVisible}
                      onChange={(e) => handlePrivacyChange('emailVisible', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Telefon Görünürlüğü</h4>
                    <p>Telefon numaranızı diğer kullanıcılar görebilir</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={privacySettings.phoneVisible}
                      onChange={(e) => handlePrivacyChange('phoneVisible', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Aktivite Görünürlüğü</h4>
                    <p>Son aktivitelerinizi diğer kullanıcılar görebilir</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={privacySettings.activityVisible}
                      onChange={(e) => handlePrivacyChange('activityVisible', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Anket Sonuçları Görünürlüğü</h4>
                    <p>Anket yanıtlarınızı diğer kullanıcılar görebilir</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={privacySettings.surveysVisible}
                      onChange={(e) => handlePrivacyChange('surveysVisible', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Bildirim Ayarları</h2>
                <p>Hangi bildirimleri almak istediğinizi seçin</p>
              </div>
 
               <div className="notification-settings">
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>E-posta Bildirimleri</h4>
                     <p>Önemli güncellemeleri e-posta ile alın</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.emailNotifications}
                       onChange={() => handleNotificationChange('emailNotifications')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Push Bildirimleri</h4>
                     <p>Tarayıcı bildirimleri alın</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.pushNotifications}
                       onChange={() => handleNotificationChange('pushNotifications')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Anket Hatırlatıcıları</h4>
                     <p>Tamamlanmamış anketler için hatırlatıcı alın</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.surveyReminders}
                       onChange={() => handleNotificationChange('surveyReminders')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Yeni Anket Bildirimleri</h4>
                     <p>Yeni anketler eklendiğinde bildirim alın</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.newSurveyAlerts}
                       onChange={() => handleNotificationChange('newSurveyAlerts')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 {/* Extended options */}
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Pazarlama Bildirimleri</h4>
                     <p>Kampanya ve duyuruları alın</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.marketingNotifications || false}
                       onChange={() => handleNotificationChange('marketingNotifications')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Sistem Bildirimleri</h4>
                     <p>Bakım ve güvenlik duyuruları</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.systemNotifications || true}
                       onChange={() => handleNotificationChange('systemNotifications')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Ses Efektleri</h4>
                     <p>Bildirim geldiğinde ses çal</p>
                   </div>
                   <label className="toggle-switch">
                     <input 
                       type="checkbox"
                       checked={notificationSettings.soundEnabled || false}
                       onChange={() => handleNotificationChange('soundEnabled')}
                     />
                     <span className="toggle-slider"></span>
                   </label>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Bildirim Sıklığı</h4>
                     <p>Hatırlatma periyodu</p>
                   </div>
                   <select 
                     value={notificationSettings.frequency || 'realtime'}
                     onChange={(e)=>{
                       const key = 'frequency';
                       const newSettings = { ...notificationSettings, [key]: e.target.value };
                       setNotificationSettings(newSettings);
                       localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
                     }}
                     className="setting-select"
                   >
                     <option value="realtime">Anında</option>
                     <option value="hourly">Saatte 1</option>
                     <option value="daily">Günlük özet</option>
                   </select>
                 </div>
 
                 <div className="setting-item">
                   <div className="setting-info">
                     <h4>Önizleme</h4>
                     <p>Test bildirimi aç</p>
                   </div>
                   <button type="button" className="action-btn export" onClick={()=>{
                     const demo = { id: `demo-${Date.now()}`, type: 'info', title: 'Test bildirimi', message: 'Ayarlar başarılı!', read: false };
                     const current = JSON.parse(localStorage.getItem('headerNotifications')||'[]');
                     const next = [demo, ...current].slice(0, 20);
                     localStorage.setItem('headerNotifications', JSON.stringify(next));
                     setMessage('Test bildirimi gönderildi');
                     setTimeout(()=>setMessage(''),1500);
                   }}>
                     Test bildirimi gönder
                   </button>
                 </div>
               </div>
             </div>
           )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Güvenlik & Hesap</h2>
                <p>Hesap güvenliği ve veri yönetimi</p>
              </div>

              <div className="security-actions">
                <div className="action-card">
                  <div className="action-info">
                    <h4>Verilerimi Dışa Aktar</h4>
                    <p>Hesap verilerinizi JSON formatında indirin</p>
                  </div>
                  <button className="action-btn export" onClick={handleExportData}>
                    <Download size={16} />
                    Dışa Aktar
                  </button>
                </div>

                <div className="action-card danger">
                  <div className="action-info">
                    <h4>Hesabı Sil</h4>
                    <p>Hesabınızı ve tüm verilerinizi kalıcı olarak silin</p>
                  </div>
                  <button className="action-btn delete" onClick={handleDeleteAccount}>
                    <Trash2 size={16} />
                    Hesabı Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default Ayarlar;