import React, { useState } from "react";
import { Search, Filter, Clock, Users, Star, TrendingUp, Award, ChevronRight } from 'lucide-react';
import Header from "../components/Header";
import Footer from '../components/Footer';
import '../css/Anketler.css'

function AnketPage () {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('all');


    const surveys = [
    {
      id: 1,
      title: "Teknoloji Kullanım Alışkanlıkları",
      description: "Günlük teknoloji kullanımınız hakkında detaylı bir anket",
      category: "Teknoloji",
      participantCount: 1243,
      rating: 4.8,
      duration: "5-10 dakika",
      reward: 50,
      status: "active",
      createdAt: "2024-01-15",
      trending: true
    },
    {
      id: 2,
      title: "Çevre Bilinci ve Sürdürülebilirlik",
      description: "Çevre konusundaki düşüncelerinizi paylaşın",
      category: "Çevre",
      participantCount: 892,
      rating: 4.6,
      duration: "8-12 dakika",
      reward: 75,
      status: "active",
      createdAt: "2024-01-10",
      trending: false
    },
    {
      id: 3,
      title: "Uzaktan Çalışma Deneyimleri",
      description: "İş hayatında uzaktan çalışma deneyimleriniz",
      category: "İş Hayatı",
      participantCount: 2156,
      rating: 4.9,
      duration: "10-15 dakika",
      reward: 100,
      status: "active",
      createdAt: "2024-01-20",
      trending: true
    },
    {
      id: 4,
      title: "Sağlıklı Yaşam Tarzı",
      description: "Beslenme ve egzersiz alışkanlıklarınız hakkında",
      category: "Sağlık",
      participantCount: 567,
      rating: 4.5,
      duration: "6-8 dakika",
      reward: 60,
      status: "active",
      createdAt: "2024-01-08",
      trending: false
    },
    {
      id: 5,
      title: "Eğitim Sisteminin Geleceği",
      description: "Eğitim teknolojileri ve öğrenme yöntemleri",
      category: "Eğitim",
      participantCount: 1789,
      rating: 4.7,
      duration: "12-18 dakika",
      reward: 120,
      status: "active",
      createdAt: "2024-01-18",
      trending: true
    },
    {
      id: 6,
      title: "Sosyal Medya Kullanımı",
      description: "Sosyal medya platformlarındaki davranışlarınız",
      category: "Sosyal",
      participantCount: 3421,
      rating: 4.4,
      duration: "7-10 dakika",
      reward: 80,
      status: "completed",
      createdAt: "2024-01-05",
      trending: false
    }
  ]; 

    const category = ['kategori1', 'kategori2', 'kategori3'];

    const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || survey.category === filterCategory;
    return matchesSearch && matchesCategory;
    });

    const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'popular':
        return b.participantCount - a.participantCount;
      case 'rating':
        return b.rating - a.rating;
      case 'reward':
        return b.reward - a.reward;
      default:
        return 0;
    }
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Teknoloji': 'from-blue-500 to-purple-600',
      'Çevre': 'from-green-500 to-teal-600',
      'İş Hayatı': 'from-orange-500 to-red-600',
      'Sağlık': 'from-pink-500 to-rose-600',
      'Eğitim': 'from-indigo-500 to-blue-600',
      'Sosyal': 'from-yellow-500 to-orange-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };
    
   
  
    return (
        <><Header />
        <div className="survey-page">
            <div className="survey-header">
                <div className="survey-header-container">
                    <div className="survey-header-conteint">
                      <div>
                        <h1 className="survey-title">
                          Anket Listesi
                        </h1>
                        <p className="survey- subtitle">
                          İlginizi çeken anketlere katılın ve kendinizi keşfedin.
                        </p>
                      </div>
                        <div className="survey-stats">
                          <div className="survey-total-badge">
                            Toplam: {surveys.length} Anket
                          </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="survey-container">
        <div className="survey-filters">
          <div className="filter-grid">
            {/* Search */}
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Anket ara..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-container">
              <Filter className="filter-icon" />
              <select
                className="filter-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {category.map(cat => (
                  <option key={cat} value={cat} className="filter-option">
                    {cat === 'all' ? 'Tüm Kategoriler' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sort-container">
              <TrendingUp className="sort-icon" />
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest" className="sort-option">En Yeni</option>
                <option value="oldest" className="sort-option">En Eski</option>
                <option value="popular" className="sort-option">En Popüler</option>
                <option value="rating" className="sort-option">En Yüksek Puan</option>
                <option value="reward" className="sort-option">En Yüksek Ödül</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="survey-container">
        <div className="survey-grid">
          {sortedSurveys.map((survey) => (
            <div
              key={survey.id}
              className="survey-card"
            >
              {survey.trending && (
                <div className="trending-badge">
                  🔥 Trend
                </div>
              )}

              <div className="card-header">
                <div className={`status-badge ${survey.status === 'active' ? 'status-active' : 'status-completed'}`}>
                  {survey.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                </div>
                <div className="rating-container">
                  <Star className="rating-star" />
                  <span className="rating-text">{survey.rating}</span>
                </div>
              </div>

              <div className={`category-badge category-${survey.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {survey.category}
              </div>

              <h3 className="card-title">
                {survey.title}
              </h3>

              <p className="card-description">
                {survey.description}
              </p>

              <div className="card-stats">
                <div className="stat-item">
                  <Users className="stat-icon stat-users" />
                  <span className="stat-text">{survey.participantCount.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <Clock className="stat-icon stat-clock" />
                  <span className="stat-text">{survey.duration}</span>
                </div>
              </div>

              <div className="card-footer">
                <div className="reward-container">
                  <Award className="reward-icon" />
                  <span className="reward-text">{survey.reward} Puan</span>
                </div>
                <ChevronRight className="arrow-icon" />
              </div>

              <div className="card-overlay" />
            </div>
          ))}
        </div>

        {sortedSurveys.length === 0 && (
          <div className="no-results">
            <div className="no-results-title">Aradığınız kriterlere uygun anket bulunamadı</div>
            <div className="no-results-subtitle">Farklı arama terimleri veya filtreler deneyebilirsiniz</div>
          </div>
        )}
      </div>
    </div>
        
        <Footer />
        </>
    )
}

export default AnketPage;