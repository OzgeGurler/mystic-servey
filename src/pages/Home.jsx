import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Star, Award, Clock, ChevronRight, BarChart3, ShieldCheck, Zap, Tag, MessageSquare, Heart, Crown, Play } from 'lucide-react';
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
        document.body.classList.add('home-body');
        document.documentElement.classList.add('home-html');
        return () => {
            document.body.classList.remove('home-body');
            document.documentElement.classList.remove('home-html');
        };
    }, []);

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

    const filteredSurveys = useMemo(() => {

        return surveys.filter(s => !!s.popular);
    }, [surveys]);

    return (
        <>
            <Header />

            <section className="hero-container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">Anket Dünyasının <span className="hero-title-gradient">Geleceği Burada</span></h1>
                        <p className="hero-subtitle">Mystic Survey ile anketleri yanıtlayın, istatistikleri görüntüleyin ve size özel sonuçlar alın.</p>
                        <button onClick={() => setIsModalOpen(true)} className="primary-button">
                            Ücretsiz Başla <ArrowRight />
                        </button>
                    </div>
                </div>
            </section>


            <section className="surveys-section">
                <div className="surveys-container">
                    <div className="surveys-header">
                        <h2 className="surveys-title">Popüler Anketler</h2>
                        <p className="surveys-subtitle">Topluluk tarafından en çok ilgi gören anketler</p>
                    </div>
                    <div className="surveys-grid">
                        {filteredSurveys.map((survey) => (
                            <Link key={survey.id} to={`/surveys/${survey.id}/solve`} className="survey-card" style={{ textDecoration: 'none' }}>
                                {/* Media Section (Image + Overlays) */}
                                <div className="card-media">
                                    {survey.coverImage ? (
                                        <img src={survey.coverImage} alt={survey.title} />
                                    ) : (
                                        <div className="card-media-placeholder">
                                            <div className="placeholder-text">Görsel Yok</div>
                                        </div>
                                    )}

                                    {(survey.popular || survey.trending) && (
                                        <div className="crown-badge">
                                            <Crown size={16} />
                                        </div>
                                    )}

                                    <div className="author-chip">
                                        <span className="author-avatar">A</span>
                                        <span className="author-name">{survey.authorName || 'Anonim'}</span>
                                    </div>

                                    <div className="play-button">
                                        <Play size={14} />
                                        <span>{(survey.participantCount || survey.Participant || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="card-content">
                                    <h3 className="card-title">{survey.title}</h3>
                                    <div className="card-meta">
                                        <div className="meta-item">
                                            <Tag size={16} />
                                            <span>{survey.category || 'Kategori'}</span>
                                            <span className="meta-count">({survey.questionCount || 0})</span>
                                        </div>
                                        <div className="meta-item">
                                            <MessageSquare size={16} />
                                            <span>{survey.commentCount || 0}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Heart size={16} />
                                            <span>{survey.likes || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover overlay */}
                                <div className="card-overlay" />
                            </Link>
                        ))}
                    </div>
                    {filteredSurveys.length === 0 && (
                        <div className="no-results">
                            <div className="no-results-title">Şu anda popüler anket bulunmuyor</div>
                            <div className="no-results-subtitle">Yönetim panelinden anketleri popüler olarak işaretleyin</div>
                        </div>
                    )}
                    <div className="view-all-container">
                        <Link to="/Anketler">
                            <button className="view-all-button">
                                Tüm Anketleri Gör <ChevronRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>


            <section className="features-section">
                <div className="features-container">
                    <div className="features-header">
                        <h2 className="features-title">Neden Mystic Survey?</h2>
                        <p className="features-subtitle">Modern, hızlı ve güvenli anket deneyimi</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Zap /></div>
                            <div className="feature-title">Hızlı Başlangıç</div>
                            <div className="feature-text">Saniyeler içinde anket yanıtlayın ve sonuçları görün.</div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><BarChart3 /></div>
                            <div className="feature-title">Gerçek Zamanlı Analiz</div>
                            <div className="feature-text">Anında güncellenen istatistikler ile derin içgörüler.</div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><ShieldCheck /></div>
                            <div className="feature-title">Güvenli</div>
                            <div className="feature-text">Verileriniz modern güvenlik standartları ile korunur.</div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-text">
                        <h3>Mystic Survey’e ücretsiz katılın</h3>
                        <p>Binlerce kullanıcıya katılın ve anket deneyimini bugün başlatın.</p>
                    </div>
                    <button className="primary-button" onClick={() => setIsModalOpen(true)}>
                        Hemen Kayıt Ol <ArrowRight />
                    </button>
                </div>
            </section>
            <Footer />
            <RegisterPopUp isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

export default Home;
