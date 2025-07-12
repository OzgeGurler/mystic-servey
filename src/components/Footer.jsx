import React from "react";
import { ClipboardList } from 'lucide-react';
import { FaInstagram, FaTwitter, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../css/Footer.css';

function Footer () {
   return ( 
   <div className="Footer-bg">
        <div className="footer-container">
            <div className="footer-logo">
                <div className="footer-icon">
                    <ClipboardList />
                </div>
            <h1 className="footer-text">Mystic Survey</h1>
            </div>
            <div className="footer-social">
                <a href="#" className="footer-social-links">
                    <FaInstagram className="footer-social-icon"/> </a>
                <a href="#" className="footer-social-links">
                    <FaTwitter className="footer-social-icon"/> </a>
                <a href="#" className="footer-social-links">
                    <FaGithub className="footer-social-icon"/> </a>
            </div>

            <div className="footer-links">
                <h4 className="footer-section-title">Hızlı Linkler</h4>
                <ul>
                    <li><Link to='/'>Ana Sayfa</Link></li>
                    <li><Link to='/Anketler'>Anketler</Link></li>
                    <li><Link to='/İletisim'>İletişim</Link></li>
                </ul>
            </div>

            <div className="footer-contract">
                <h4 className="footer-section-title">Destek</h4>
                <ul>
                    <li><Link to='/Anketler'>İletişim</Link></li>
                    <li><Link to='/İletisim'>Gizlilik Politikası</Link></li>
                    <li><Link to='/İletisim'>Kullanım Politikası</Link></li>
                    <li><Link to='/İletisim'>SSS</Link></li>
                </ul>
            </div>
            <div className="footer-sup">
                <h4 className="footer-section-title">Yardım Merkezi</h4>
                <p>email1</p>
                <p>email2</p>
                <p>numara1</p>
                <p>numara2</p>
            </div>
        </div>
    </div>
   );
}

export default Footer;