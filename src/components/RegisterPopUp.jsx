import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import '../css//RegisterPopUp.css';

function RegisterPopUp({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Pop-up açıkken body scroll'ını engelle
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup function
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Ad Soyad gereklidir';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        
        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        
        alert('Kayıt başarılı! Hoş geldiniz.');
        
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        
        onClose();
    };

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className='popup-container'>
            <div className='popup-content'>
                <div className='popup-header'>
                    <h2 className='popup-title'>Kayıt Ol</h2>
                    <button onClick={handleClose}>
                        <X className='w-6 h-6'/>
                    </button>
                </div>

                <div className='popup-body'>
                    <div className='popup-subtitle'>
                        <p>Hesap oluşturun ve anket çözmeye başlayın.</p>
                    </div>

                    <div className='form-container'>
                        <div className='form-group'>
                            <label htmlFor="name" className='form-label'>
                                Ad Soyad
                            </label>
                            <div className='input-container'>
                                <User className='input-icon'/>
                                <input 
                                    type="text"
                                    id='name'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder='Adınızı ve soyadınızı girin'
                                />
                            </div>
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                E-posta
                            </label>
                            <div className="input-container">
                                <Mail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="E-posta adresinizi girin"
                                />
                            </div>
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Şifre
                            </label>
                            <div className="input-container">
                                <Lock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Şifrenizi girin"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="error-message">{errors.password}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Şifre Tekrar
                            </label>
                            <div className="input-container">
                                <Lock className="input-icon" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                    placeholder="Şifrenizi tekrar girin"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="password-toggle"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            onClick={handleSubmit}
                            className='submit-button'
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    <div className='popup-footer'>
                        <p className='footer-text'>
                            Zaten hesabınız var mı?{' '}
                            <button className='footer-link'>
                                Giriş Yap
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPopUp;