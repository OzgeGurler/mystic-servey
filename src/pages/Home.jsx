import React, { useState, useEffect } from "react";
import { Users, TrendingUp, ArrowRight, Star, Eye, Heart, ClipboardList, Award, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import Header from '../components/Header.jsx'
import Footer from "../components/Footer.jsx";
import '../css//Home.css';

function Home() {
    const [searchTerm, setSearchTerm] = useState('');

    const features = [
        {
            icon: <ClipboardList className="w-8 h-8 text-blue-500" />,
            title: 'Çeşitli Anketler',
            desc: 'Farklı kategorilerde anketler çözerek kendinizi keşfedin.'
        },
        {
            icon: <Users className="w-8 h-8 text-green-500" />,
            title: 'Geniş Topluluk',
            desc: 'Binlerce kişiyle sonuçlarınızı karşılaştırın.'
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
            title: 'Anlık Analiz',
            desc: 'Gerçek zamanlı sonuçlar ve detaylı raporlar'
        }
    ];

    const popularSurveys = [
        {
            id: 1,
            title: "Teknoloji Kullanım Alışkanlıkları",
            description: "Günlük teknoloji kullanımınız hakkında detaylı bir anket",
            category: "Teknoloji",
            participantCount: 1243,
            rating: 4.8,
            duration: "5-10 dakika",
            reward: 50,
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
            trending: false
        }
    ];

    const stats = [
        { label: 'Toplam Anket', value: '1,245', icon: <ClipboardList className="w-6 h-6" /> },
        { label: 'Aktif Kullanıcı', value: '12,543', icon: <Users className="w-6 h-6" /> },
        { label: 'Tamamlanan Anket', value: '45,678', icon: <Award className="w-6 h-6" /> }
    ];

    return (
        <>
            <Header />
            
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Anket Dünyasının
                            <span className="hero-title-gradient">
                                Geleceği Burada
                            </span>
                        </h1>
                        <p className="hero-subtitle">
                            Mystic Survey ile anketleri yanıtlayın, istatistikleri görüntüleyin ve özel sonuçlar elde edin.
                        </p>
                        
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Anket ara..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="primary-button">
                            Ücretsiz Başla
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stats-container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-icon">
                                    {stat.icon}
                                </div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="surveys-section">
                <div className="surveys-container">
                    <div className="surveys-header">
                        <h2 className="surveys-title">
                            Popüler Anketler
                        </h2>
                        <p className="surveys-subtitle">
                            Hemen anketleri yanıtlayın ve sizin verdiğiniz cevaplara göre bir sonuç alın.
                        </p>
                    </div>

                    <div className="surveys-grid">
                        {popularSurveys.map((survey) => (
                            <div
                                key={survey.id}
                                className="survey-card"
                            >
                                {survey.trending && (
                                    <div className="trending-badge">
                                        🔥 Trend
                                    </div>
                                )}

                                <div className="survey-category">
                                    {survey.category}
                                </div>

                                <h3 className="survey-title">
                                    {survey.title}
                                </h3>

                                <p className="survey-description">
                                    {survey.description}
                                </p>

                                <div className="survey-stats">
                                    <div className="survey-stat">
                                        <Users className="w-4 h-4" />
                                        <span>{survey.participantCount.toLocaleString()}</span>
                                    </div>
                                    <div className="survey-stat">
                                        <Clock className="w-4 h-4" />
                                        <span>{survey.duration}</span>
                                    </div>
                                </div>

                                <div className="survey-footer">
                                    <div className="survey-rating">
                                        <Star className="rating-star" />
                                        <span className="rating-text">{survey.rating}</span>
                                    </div>
                                    <div className="survey-reward">
                                        <Award className="w-4 h-4" />
                                        <span className="reward-text">{survey.reward} Puan</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="view-all-container">
                        <button className="view-all-button">
                            Tüm Anketleri Gör
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <div className="features-container">
                    <div className="features-header">
                        <h2 className="features-title">
                            Neden Mystic Survey?
                        </h2>
                        <p className="features-subtitle">
                            Profesyonel anket deneyimi için ihtiyacınız olan her şey
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">
                                    {feature.title}
                                </h3>
                                <p className="feature-description">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <div className="cta-container">
                    <h2 className="cta-title">
                        Anket Dünyasına Katılın
                    </h2>
                    <p className="cta-subtitle">
                        Hemen ücretsiz hesap oluşturun ve anketleri yanıtlamaya başlayın
                    </p>
                    <button className="cta-button">
                        Hemen Başla
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default Home;