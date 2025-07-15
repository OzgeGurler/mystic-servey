import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Users, TrendingUp, ArrowRight, Star, Award, Clock, ChevronRight, Search } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from "../components/Footer.jsx";
import RegisterPopUp from '../components/RegisterPopUp.jsx';
import '../css/Home.css';
import { db } from "../services/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [surveys, setSurveys] = useState([]);

    
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "surveys"), (querySnapshot) => {
            const surveysData = [];
            querySnapshot.forEach((doc) => {
                surveysData.push({ id: doc.id, ...doc.data() });
            });
            setSurveys(surveysData);
        });

        return () => unsubscribe();
    }, []);

    const filteredSurveys = surveys.filter(survey => 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Header />
            <div className="survey-page">
                <div className="survey-header">
                    <div className="survey-header-container">
                        <div className="survey-header-content">
                            <h1 className="survey-title">
                                Anket Dünyasının <span className="hero-title-gradient">Geleceği Burada</span>
                            </h1>
                            <p className="survey-subtitle">
                                Mystic Survey ile anketleri yanıtlayın, istatistikleri görüntüleyin ve özel sonuçlar elde edin.
                            </p>
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
                            <button onClick={() => setIsModalOpen(true)} className="primary-button">
                                Ücretsiz Başla <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="survey-container">
                    <h2 className="surveys-title">Popüler Anketler</h2>
                    <p className="surveys-subtitle">Hemen anketleri yanıtlayın ve özel sonuçlar alın.</p>
                    <div className="survey-grid">
                        {filteredSurveys.map((survey) => (
                            <div key={survey.id} className="survey-card">
                                {survey.trending && (
                                    <div className="trending-badge">🔥 Trend</div>
                                )}
                                <div className="card-header">
                                    <div className={`status-badge ${survey.active ? 'status-active' : 'status-completed'}`}>
                                        {survey.active ? 'Aktif' : 'Tamamlandı'}
                                    </div>
                                    <div className="rating-container">
                                        <Star className="rating-star" />
                                        <span className="rating-text">{survey.rating || 0}</span>
                                    </div>
                                </div>
                                <div className="category-badge">
                                    {survey.category || "Kategori Yok"}
                                </div>
                                <h3 className="card-title">{survey.title}</h3>
                                <p className="card-description">{survey.description || ""}</p>
                                <div className="card-stats">
                                    <div className="stat-item">
                                        <Users className="stat-icon stat-users" />
                                        <span className="stat-text">{(survey.participantCount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="stat-item">
                                        <Clock className="stat-icon stat-clock" />
                                        <span className="stat-text">{survey.duration || "-"}</span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="reward-container">
                                        <Award className="reward-icon" />
                                        <span className="reward-text">{survey.reward || 0} Puan</span>
                                    </div>
                                    <ChevronRight className="arrow-icon" />
                                </div>
                                <div className="card-overlay" />
                            </div>
                        ))}
                    </div>
                    {filteredSurveys.length === 0 && (
                        <div className="no-results">
                            <div className="no-results-title">Aradığınız kriterlere uygun anket bulunamadı</div>
                            <div className="no-results-subtitle">Farklı arama terimleri deneyebilirsiniz</div>
                        </div>
                    )}
                    <div className="view-all-container">
                        <Link to="/Anketler">
                            <button className="view-all-button">
                                Tüm Anketleri Gör <ChevronRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
            <RegisterPopUp isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

export default Home;
