import React, { useEffect, useRef, useState } from "react";
import { ClipboardList, Mail, Phone, MapPin } from 'lucide-react';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../css/Footer.css';

function Footer() {
    const footerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        }, { threshold: 0.05 });
        footerRef.current && observer.observe(footerRef.current);


        const onScroll = () => {
            const scrollBottom = window.scrollY + window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            if (docHeight - scrollBottom < 200) setIsVisible(true);
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

   return ( 
        <div ref={footerRef} className={`Footer-bg ${isVisible ? 'visible' : ''}`}>
            <div className="Footer-container">
                <div className="Footer-content">

                    <div className="Footer-section">
                        <h3 className="Footer-title">Mystic Survey</h3>
                        <p className="Footer-text">
                            Modern ve kullanıcı dostu anket platformu. Anketleri yanıtlayın, 
                            istatistikleri görüntüleyin ve size özel sonuçlar alın.
                        </p>
                        <div className="Footer-social">
                            <a href="#" className="Footer-social-link" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="#" className="Footer-social-link" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="#" className="Footer-social-link" aria-label="GitHub">
                                <FaGithub />
                            </a>
                            <a href="#" className="Footer-social-link" aria-label="LinkedIn">
                                <FaLinkedin />
                            </a>
            </div>
            </div>


                    <div className="Footer-section">
                        <h3 className="Footer-title">Hızlı Linkler</h3>
                        <ul className="Footer-list">
                            <li><Link to="/" className="Footer-link">Ana Sayfa</Link></li>
                            <li><Link to="/Anketler" className="Footer-link">Anketler</Link></li>
                            <li><Link to="/iletisim" className="Footer-link">İletişim</Link></li>
                            <li><Link to="/profil" className="Footer-link">Profil</Link></li>
                </ul>
            </div>


                    <div className="Footer-section">
                        <h3 className="Footer-title">Destek</h3>
                        <ul className="Footer-list">
                            <li><Link to="/iletisim" className="Footer-link">İletişim</Link></li>
                            <li><Link to="/gizlilik" className="Footer-link">Gizlilik Politikası</Link></li>
                            <li><Link to="/kullanim" className="Footer-link">Kullanım Şartları</Link></li>
                            <li><Link to="/sss" className="Footer-link">Sık Sorulan Sorular</Link></li>
                </ul>
            </div>


                    <div className="Footer-section">
                        <h3 className="Footer-title">Bülten</h3>
                        <p className="Footer-text">
                            Yeni anketler ve güncellemelerden haberdar olmak için bültenimize katılın.
                        </p>
                        <div className="Footer-newsletter">
                            <input 
                                type="email" 
                                placeholder="E-posta adresiniz"
                                className="Footer-newsletter-input"
                            />
                            <button className="Footer-newsletter-button">
                                Abone Ol
                            </button>
                        </div>
                    </div>
                </div>

                <div className="Footer-bottom">
                    <div className="Footer-copyright">
                        © 2024 Mystic Survey. Tüm hakları saklıdır.
                    </div>
                    <div className="Footer-links">
                        <a href="/gizlilik" className="Footer-link">Gizlilik</a>
                        <a href="/kullanim" className="Footer-link">Şartlar</a>
                        <a href="/cerezler" className="Footer-link">Çerezler</a>
                    </div>
            </div>
        </div>
    </div>
   );
}

export default Footer;