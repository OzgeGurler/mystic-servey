import React, { useState } from "react";
import { ClipboardList } from 'lucide-react';
import { Link } from "react-router-dom"
import '../css/Header.css'

function Header () {
    return (
            <header className='header'>
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
                    <button className="btn-reg">Kayıt Ol</button>
                </div>
                </div>
            </header>
    )

}

export default Header;