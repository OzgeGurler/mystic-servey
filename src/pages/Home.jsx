import React from "react";
import { House, Users, TrendingUp, ArrowRight, Star, Eye, Heart, ClipboardList, Section } from 'lucide-react';
import Header from '../components/Header.jsx'
import Footer from "../components/Footer.jsx";

function Home() {
    const features = [
        {
            icon: <ClipboardList className="features-icon" />,
            title: 'Birbirinden Farklı Anketler',
            desc: 'Birbirinden ayrı anketler çözerek kendinizi keşfedin.'
        },
        {
            icon: <Users className="features-icon" />,
            title: 'Geniş Kitleyle Çözün',
            desc: 'Binlerce kişiyle sonuçlarınızı karşılaştırın.'
        },
        {
            icon: <TrendingUp className="features-icon" />,
            title: 'Anlık Analiz',
            desc: 'Gerçek zamanlı sonuçlar ve detaylı raporlar'
        }
    ]

    const popularSurveys = [
        {
            title: "Müşteri Memnuniyeti Araştırması",
            description: "Müşteri deneyimini ölçmek için kapsamlı anket şablonu",
            views: "12.5K",
            rating: 4.8,
            category: "İş",
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Çalışan Engagement Anketi",
            description: "Çalışan memnuniyeti ve bağlılığını ölçen profesyonel anket",
            views: "8.2K",
            rating: 4.9,
            category: "İK",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Pazar Araştırması Şablonu",
            description: "Yeni ürün lansmanı öncesi pazar analizi için ideal anket",
            views: "15.3K",
            rating: 4.7,
            category: "Pazarlama",
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Etkinlik Değerlendirme Anketi",
            description: "Etkinlik sonrası katılımcı feedback'i toplama anketi",
            views: "6.8K",
            rating: 4.6,
            category: "Etkinlik",
            color: "from-orange-500 to-red-500"
        }
    ];


    return (
        <><><Header /><Footer /></>
            <div className="SurveyHome-Container">
                <div className="Animation-background">
                    <div className="bg-orb-1"></div>
                    <div className="bg-orb-2"></div>
                </div>
            </div>
            <section className="part1-section">
                <div className="part1-container">
                    <div className="part1-elements">
                        <h1 className="part1-title">Anket Dünyasının
                            <span className="part1-subtitle">Geleceği Burada</span>
                        </h1>
                        <p className="part1-description">
                            Mystic Survey ile Anketleri Yanıtlayın, İstatistikleri Görüntüleyin ve Büyüleyici Analitik Sonuçlar Elde Edin
                        </p>
                        <div className="part1-button">
                            <button className="btn-primary group">
                                Ücretsiz Başla
                                <ArrowRight className="arrow-icon" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>


            <section className="popular-section">
                <div className="popular-container">
                    <div className="popular-section-header">
                        <h2 className="popular-section-title">
                            Popüler Anketler
                        </h2>
                        <p className="popular-section-description">
                            Hemen Anketleri Yanıtlayın ve Anket Analizlerine Anında Erişin
                        </p>
                    </div>

                </div>
            </section>

            <section className="features-section">
                <div className="feature-container">
                    <div className="feature-header">
                        <h2 className="feature-title">Neden Mystic Survey</h2>
                        <p className="feature-description">Egzotik Anketlerle </p>
                    </div>
                </div>
            </section>

        </>
    );
}

export default Home;