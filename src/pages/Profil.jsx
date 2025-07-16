import React, { useEffect, useState } from 'react';
import UserService from '../services/userService';
import { Calendar, Mail, User } from 'lucide-react';
import '../css/Profil.css';

function Profil({ totalSurveyCount = 10 }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
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
      setUser(foundUser);
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Bilinmiyor';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) return <div className="profil-container">Yükleniyor...</div>;
  if (!user) return <div className="profil-container">Kullanıcı bilgisi bulunamadı</div>;

  const completedSurveys = user.completesurvey || 0;
  const completionRate = totalSurveyCount > 0 ? ((completedSurveys / totalSurveyCount) * 100).toFixed(1) : 0;

  return (
    <div className="profil-container">
      <div className="profil-card">
        <h2 className="profil-title">Profil</h2>
        <div className="profil-info">
          <p><User size={16} /> <strong>Ad:</strong> {user.name}</p>
          <p><Mail size={16} /> <strong>E-posta:</strong> {user.email}</p>
          <p><Calendar size={16} /> <strong>Kuruluş Tarihi:</strong> {formatDate(user.createdAt)}</p>
        </div>
        <div className="profil-survey">
          <h3>Anket İlerlemesi</h3>
          <p><strong>Oran:</strong> {completionRate}%</p>
          <p><strong>Çözdüğü anket sayısı:</strong> {completedSurveys} / {totalSurveyCount}</p>
        </div>
      </div>
    </div>
  );
}

export default Profil;
