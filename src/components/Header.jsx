import React, { useState, useEffect } from "react";
import { ClipboardList, User, Settings, FileText, LogOut, ChevronDown } from 'lucide-react';
import { Link } from "react-router-dom";
import RegisterPopUp from '../components/RegisterPopUp.jsx';
import LoginPopUp from "./LoginPopUp.jsx";
import '../css/Header.css';

function Header() {
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        setUser(null);
        setMenuOpen(false);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        let lastScrollTop = 0;
        const scrollThreshold = 50;

        function handleHeaderScroll() {
            const header = document.querySelector('.header');
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
                header?.classList.add('header-hidden');
            } else if (currentScrollTop < lastScrollTop) {
                header?.classList.remove('header-hidden');
            }

            if (currentScrollTop <= 0) {
                header?.classList.remove('header-hidden');
            }

            lastScrollTop = currentScrollTop;
        }

        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        };

        const throttledScrollHandler = throttle(handleHeaderScroll, 10);
        window.addEventListener('scroll', throttledScrollHandler, { passive: true });

        return () => {
            window.removeEventListener('scroll', throttledScrollHandler);
        };
    }, []);

    return (
        <>
            <header className='header'>
                <div className="header-container">
                    <div className="logo">
                        <div className="logo-icon">
                            <ClipboardList />
                        </div>
                        <h1 className="logo-text">Mystic Survey</h1>
                    </div>
                    <nav className="nav">
                        <Link to="/">Ana Sayfa</Link>
                        <Link to="/Anketler">Anketler</Link>
                    </nav>

                    <div className="header-buttons">
                        {user ? (
                            <div className="user-menu">
                                <button className="user-menu-toggle" onClick={toggleMenu}>
                                    Hoşgeldin, {user.name} <ChevronDown size={16} />
                                </button>
                                {menuOpen && (
                                    <div className="user-menu-dropdown">
                                        <Link to="/profil" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                            <User size={16} /> Profil
                                        </Link>
                                        <Link to="/ayarlar" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                            <Settings size={16} /> Ayarlar
                                        </Link>
                                        <Link to="/anketlerim" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                            <FileText size={16} /> Anketlerim
                                        </Link>
                                        <button onClick={handleLogout} className="user-menu-item">
                                            <LogOut size={16} /> Çıkış Yap
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => setIsLoginOpen(true)} className="btn-login">Giriş Yap</button>
                                <button onClick={() => setIsRegOpen(true)} className="btn-reg">Kayıt Ol</button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <RegisterPopUp
                isOpen={isRegOpen}
                onClose={() => setIsRegOpen(false)} 
            />

            <LoginPopUp
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={(loggedInUser) => {
                    setUser(loggedInUser);
                    setIsLoginOpen(false);
                }}
            />
        </>
    );
}

export default Header;
