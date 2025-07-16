import React, { useState, useEffect } from "react";
import { Search, Filter, Clock, Users, Star, TrendingUp, Award, ChevronRight } from 'lucide-react';
import Header from "../components/Header";
import Footer from '../components/Footer';
import '../css/Anketler.css';
import { db } from "../services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

function AnketPage () {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('all');
    const [surveys, setSurveys] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "surveys"));
                const surveysData = [];
                querySnapshot.forEach((doc) => {
                    surveysData.push({ id: doc.id, ...doc.data() });
                });
                setSurveys(surveysData);
            } catch (error) {
                console.error("Anketler getirilemedi:", error);
            }
        };
        fetchSurveys();
    }, []);

    const filteredSurveys = surveys.filter(survey => {
        const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase());
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
                return (b.participantCount || 0) - (a.participantCount || 0);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'reward':
                return (b.reward || 0) - (a.reward || 0);
            default:
                return 0;
        }
    });

    return (
        <>
            <Header />
            <div className="survey-page">
                <div className="survey-header">
                    <div className="survey-header-container">
                        <div className="survey-header-conteint">
                            <div>
                                <h1 className="survey-title">Anket Listesi</h1>
                                <p className="survey-subtitle">
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
                                    <option value="all">Tüm Kategoriler</option>
                                </select>
                            </div>
                            <div className="sort-container">
                                <TrendingUp className="sort-icon" />
                                <select
                                    className="sort-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">En Yeni</option>
                                    <option value="oldest">En Eski</option>
                                    <option value="popular">En Popüler</option>
                                    <option value="rating">En Yüksek Puan</option>
                                    <option value="reward">En Yüksek Ödül</option>
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
                            onClick={() => navigate(`/surveys/${survey.id}/solve`)}
                            style={{ cursor: "pointer" }}
                            >
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
    );
}

export default AnketPage;
