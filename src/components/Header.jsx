import React, { useState, useEffect, useRef } from "react";
import { ClipboardList, User, Settings, FileText, LogOut, ChevronDown, Bell, Check, Info, CheckCircle, AlertTriangle, XCircle, BellRing } from 'lucide-react';
import { Link } from "react-router-dom";
import RegisterPopUp from '../components/RegisterPopUp.jsx';
import LoginPopUp from "./LoginPopUp.jsx";
import '../css/Header.css';
import notificationService, { subscribeToNotifications, markAllRead as backendMarkAllRead } from '../services/notificationService.js';

function Header() {
    const [isRegOpen, setIsRegOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [siteTitle, setSiteTitle] = useState('Mystic Survey');
    const [showContactLink, setShowContactLink] = useState(true);
    const [hideOnScroll, setHideOnScroll] = useState(true);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
        if (savedUser) {
            setUser(savedUser);
        }
        let unsub = null;
        try {
            const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
            if (settings.siteTitle) setSiteTitle(settings.siteTitle);
            if (typeof settings.showContactLink === 'boolean') setShowContactLink(settings.showContactLink);
            if (settings.header && typeof settings.header.hideOnScroll === 'boolean') setHideOnScroll(settings.header.hideOnScroll);
        } catch {}

        try {
            if (savedUser?.id) {
                unsub = subscribeToNotifications(savedUser.id, (itemsOrUpdater) => {
                    if (typeof itemsOrUpdater === 'function') {
                        setNotifications(prev => itemsOrUpdater(prev));
                    } else {
                        setNotifications(itemsOrUpdater || []);
                    }
                });
            } else {
                setNotifications([]);
            }
        } catch (e) {
            console.error('Bildirim aboneliği hatası:', e);
            setNotifications([]);
        }
        return () => { if (unsub) unsub(); };
    }, []);


    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [menuOpen]);

    useEffect(() => {
        function handleClickOutsideNotif(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }
        if (notifOpen) {
            document.addEventListener('mousedown', handleClickOutsideNotif);
            return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
        }
    }, [notifOpen]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        setUser(null);
        setMenuOpen(false);
    };

    const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Toggle menu clicked, current state:', menuOpen); // Debug log
        setMenuOpen(!menuOpen);
    };

    const toggleNotif = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setNotifOpen(!notifOpen);
        setMenuOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = async () => {
        try {
            if (user?.id) await backendMarkAllRead(user.id);
        } catch {}
    };

    const renderNotifIcon = (type) => {
        const iconSize = 16;
        switch (type) {
            case 'success':
                return <CheckCircle size={iconSize} />;
            case 'warning':
                return <AlertTriangle size={iconSize} />;
            case 'error':
                return <XCircle size={iconSize} />;
            case 'info':
            default:
                return <Info size={iconSize} />;
        }
    };

    useEffect(() => {
        if (!hideOnScroll) return;
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
    }, [hideOnScroll]);

    console.log('Header render - menuOpen:', menuOpen, 'user:', user); // Debug log

    return (
        <>
            <header className='header'>
                <div className="header-container header-grid">
                    <div className="header-left-slot">
                        <Link to="/" className="logo" aria-label="Ana sayfa">
                            <div className="logo-icon">
                                <ClipboardList />
                            </div>
                            <h1 className="logo-text">{siteTitle}</h1>
                        </Link>
                    </div>

                    <nav className="nav header-center-slot">
                        <Link to="/">Ana Sayfa</Link>
                        <Link to="/Anketler">Anketler</Link>
                        {showContactLink && <Link to="/iletisim">İletişim</Link>}
                    </nav>

                    <div className="header-buttons header-right-slot">
                        <div className="notif-menu" ref={notifRef}>
                            <button className="notif-button" onClick={toggleNotif} aria-label="Bildirimler">
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="notif-badge">{unreadCount}</span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="notif-dropdown">
                                    <div className="notif-header">
                                        <div className="notif-header-left"><BellRing size={16} /><span>Bildirimler</span></div>
                                        {unreadCount > 0 && (
                                            <button className="notif-markread" onClick={markAllRead}><Check size={14}/> Tümü okundu</button>
                                        )}
                                    </div>
                                    <div className="notif-list">
                                        {notifications.length === 0 && (
                                            <div className="notif-empty">Henüz bildiriminiz yok</div>
                                        )}
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${n.read ? 'read' : ''} ${n.type || 'info'}`}>
                                                <div className={`notif-icon ${n.type || 'info'}`}>{renderNotifIcon(n.type)}</div>
                                                <div className="notif-content">
                                                    <div className="notif-title">{n.title}</div>
                                                    <div className="notif-message">{n.message}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {user ? (
                            <div className="user-menu" ref={menuRef}>
                                <button 
                                    className="user-menu-toggle" 
                                    onClick={toggleMenu}
                                    type="button"
                                >
                                    Hoşgeldin, {user.name} <ChevronDown size={16} />
                                </button>
                                {menuOpen && (
                                    <div className="user-menu-dropdown" style={{ 
                                        display: 'block',
                                        visibility: 'visible',
                                        opacity: 1,
                                        pointerEvents: 'auto'
                                    }}>
                                        <Link to="/profil" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                            <User size={16} /> Profil
                                        </Link>
                                        <Link to="/ayarlar" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                            <Settings size={16} /> Ayarlar
                                        </Link>
                                        <Link to="/anketlerim" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                            <FileText size={16} /> Anketlerim
                                        </Link>
                                    
                                        {user && user.role === "admin" && (
                                            <Link to="/admin" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                                Admin Paneli
                                            </Link>
                                        )}
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
                onLoginClick={() => {
                setIsRegOpen(false);
                setIsLoginOpen(true);
                }}
            />

                <LoginPopUp
                    isOpen={isLoginOpen}
                    onClose={() => setIsLoginOpen(false)}
                    onRegisterClick={() => {
                        setIsLoginOpen(false);
                        setIsRegOpen(true);
                    }}
                    onLoginSuccess={(loggedInUser) => {
                        setUser(loggedInUser);
                        setIsLoginOpen(false);
                    }}
                />
        </>
    );
}

export default Header;
