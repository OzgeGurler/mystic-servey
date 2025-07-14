import React, { useState, useEffect } from "react";
import { ClipboardList } from 'lucide-react';
import { Link } from "react-router-dom"
import RegisterPopUp from '../components/RegisterPopUp.jsx';
import '../css/Header.css'

function Header () {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    
    
    useEffect(() => {
        let lastScrollTop = 0;
        const scrollThreshold = 50; //burayı kafana göre değiştirebilirsin özge

        function handleHeaderScroll() {
            const header = document.querySelector('.header');
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            console.log('Scroll position:', currentScrollTop);
            console.log('Header element:', header);
            
            if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
                header?.classList.add('header-hidden');
                console.log('Header hidden class added');
            } else if (currentScrollTop < lastScrollTop) {
                header?.classList.remove('header-hidden');
                console.log('Header hidden class removed');
            }
            
            if (currentScrollTop <= 0) {
                header?.classList.remove('header-hidden');
            }
            
            lastScrollTop = currentScrollTop;
        }

        function initFooterObserver() {
            const footer = document.querySelector('.Footer-bg');
            
            if (!footer) return;
            
            const footerObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('footer-visible');
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );
            
            footerObserver.observe(footer);
        }

        function throttle(func, limit) {
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
        }

        const throttledScrollHandler = throttle(handleHeaderScroll, 10);
        
        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
        
        setTimeout(initFooterObserver, 100);

        return () => {
            window.removeEventListener('scroll', throttledScrollHandler);
        };
    }, []);

    return (
            <><header className='header'>
            <div className="header-container">
                <div className="logo">
                    <div className="logo-icon">
                        <ClipboardList />
                    </div>
                    <h1 className="logo-text">Mystic Survey</h1>
                </div>
                <nav className="nav">
                    <a href="/">Ana Sayfa</a>
                    <a href="/Anketler">Anketler</a>
                </nav>

                <div className="header-buttons">
                    <button className="btn-login">Giriş Yap</button>
                    <button onClick={() => setIsModalOpen(true)} className="btn-reg">Kayıt Ol</button>
                </div>
            </div>
        </header>
        
                <RegisterPopUp
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} 
                />
                
                </>
    )

}

export default Header;