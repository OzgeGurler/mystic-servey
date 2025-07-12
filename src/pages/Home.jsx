import React from "react";
import { House, Users, TrendingUp, Play, ArrowRight, Star, Eye, Heart, ClipboardList } from 'lucide-react';
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
        
        
        </>
    );
}

export default Home;