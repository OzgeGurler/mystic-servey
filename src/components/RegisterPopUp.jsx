import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import UserService from '../services/userService';
import '../css/RegisterPopUp.css';

function RegisterPopUp({ isOpen, onClose, onLoginClick }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

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

    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('En az 8 karakter');
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('En az bir küçük harf');
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('En az bir büyük harf');
        }
        
        if (!/(?=.*\d)/.test(password)) {
            errors.push('En az bir rakam');
        }
        
        return errors;
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Ad Soyad gereklidir';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Ad Soyad en az 2 karakter olmalıdır';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        
        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else {
            const passwordErrors = validatePassword(formData.password);
            if (passwordErrors.length > 0) {
                newErrors.password = `Şifre şu gereksinimleri karşılamalıdır: ${passwordErrors.join(', ')}`;
            }
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkEmailExists = async (email) => {
        try {
            const users = await UserService.getAllUsers();
            return users.some(user => user.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('Email kontrolü sırasında hata:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setErrors({});
        
        try {
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                setErrors({ email: 'Bu e-posta adresi zaten kullanılıyor' });
                setLoading(false);
                return;
            }

            const userData = {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
                role: 'user',
                phone: '',
                isActive: true
            };

            await UserService.addUser(userData);
            
            setSuccess(true);
            
            setTimeout(() => {
                handleClose();
                setSuccess(false);
            }, 2000);
            
        } catch (error) {
            console.error('Kayıt sırasında hata:', error);
            
            if (error.code === 'auth/email-already-in-use') {
                setErrors({ email: 'Bu e-posta adresi zaten kullanılıyor' });
            } else if (error.code === 'auth/weak-password') {
                setErrors({ password: 'Şifre çok zayıf' });
            } else if (error.code === 'auth/invalid-email') {
                setErrors({ email: 'Geçersiz e-posta adresi' });
            } else {
                setErrors({ general: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        setSuccess(false);
        setLoading(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const handleLoginClick = () => {
        handleClose();
        if (onLoginClick) {
            onLoginClick();
        }
    };

    if (!isOpen) return null;

    return (
        <div className='popup-container'>
            <div className='popup-content'>
                <div className='popup-header'>
                    <h2 className='popup-title'>Kayıt Ol</h2>
                    <button onClick={handleClose} disabled={loading}>
                        <X className='w-6 h-6'/>
                    </button>
                </div>

                <div className='popup-body'>
                    <div className='popup-subtitle'>
                        <p>Hesap oluşturun ve anket çözmeye başlayın.</p>
                    </div>

                    {errors.general && (
                        <div className="alert alert-error">
                            <AlertCircle className="w-5 h-5" />
                            <span>{errors.general}</span>
                        </div>
                    )}


                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle className="w-5 h-5" />
                            <span>Kayıt başarılı! Hoş geldiniz.</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='form-container'>
                        <div className='form-group'>
                            <label htmlFor="name" className='form-label'>
                                Ad Soyad *
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
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                E-posta *
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
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Şifre *
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
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="error-message">{errors.password}</p>}
                            <div className="password-requirements">
                                <p className="requirements-text">Şifre gereksinimleri:</p>
                                <ul className="requirements-list">
                                    <li className={formData.password.length >= 8 ? 'valid' : 'invalid'}>
                                        En az 8 karakter
                                    </li>
                                    <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : 'invalid'}>
                                        En az bir küçük harf
                                    </li>
                                    <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : 'invalid'}>
                                        En az bir büyük harf
                                    </li>
                                    <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : 'invalid'}>
                                        En az bir rakam
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Şifre Tekrar *
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
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="password-toggle"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            className={`submit-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                'Kayıt Ol'
                            )}
                        </button>
                    </form>

                    <div className='popup-footer'>
                        <p className='footer-text'>
                            Zaten hesabınız var mı?{' '}
                            <button 
                                className='footer-link'
                                onClick={handleLoginClick}
                                disabled={loading}
                            >
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