import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, X, Loader2, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import UserService from '../services/userService';
import '../css/LoginPopUp.css';

function LoginPopUp({ isOpen, onClose, onRegisterClick, onLoginSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

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

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        
        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const authenticateUser = async (email, password) => {
        try {
            const users = await UserService.getAllUsers();
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password &&
                u.isActive
            );
            
            if (user) {
                const userInfo = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    loginTime: new Date().toISOString()
                };

                if (rememberMe) {
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                } else {
                    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                }

                return { success: true, user: userInfo };
            } else {
                return { success: false, message: 'E-posta veya şifre hatalı' };
            }
        } catch (error) {
            console.error('Giriş kontrolü sırasında hata:', error);
            return { success: false, message: 'Giriş sırasında bir hata oluştu' };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setErrors({});
        
        try {
            const result = await authenticateUser(formData.email, formData.password);
            
            if (result.success) {
                setSuccess(true);
                
                if (onLoginSuccess) {
                    onLoginSuccess(result.user);
                }
                
                setTimeout(() => {
                    handleClose();
                }, 1500);
            } else {
                setErrors({ general: result.message });
            }
            
        } catch (error) {
            console.error('Giriş sırasında hata:', error);
            setErrors({ general: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            email: '',
            password: ''
        });
        setErrors({});
        setSuccess(false);
        setLoading(false);
        setShowPassword(false);
        setRememberMe(false);
        onClose();
    };

    const handleRegisterClick = () => {
        handleClose();
        if (onRegisterClick) {
            onRegisterClick();
        }
    };

    const handleForgotPassword = () => {
        alert('Şifre sıfırlama özelliği yakında eklenecek');
    };

    if (!isOpen) return null;

    return (
        <div className='login-popup-container'>
            <div className='login-popup-content'>
                <div className='login-popup-header'>
                    <h2 className='login-popup-title'>Giriş Yap</h2>
                    <button onClick={handleClose} disabled={loading}>
                        <X className='w-6 h-6'/>
                    </button>
                </div>

                <div className='login-popup-body'>
                    <div className='login-popup-subtitle'>
                        <p>Hesabınıza giriş yapın ve anketlere katılın.</p>
                    </div>

                    {errors.general && (
                        <div className="login-alert login-alert-error">
                            <AlertCircle className="w-5 h-5" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    {success && (
                        <div className="login-alert login-alert-success">
                            <CheckCircle className="w-5 h-5" />
                            <span>Giriş başarılı! Yönlendiriliyorsunuz...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='login-form-container'>
                        <div className='login-form-group'>
                            <label htmlFor="email" className='login-form-label'>
                                E-posta *
                            </label>
                            <div className='login-input-container'>
                                <Mail className='login-input-icon'/>
                                <input 
                                    type="email"
                                    id='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`login-form-input ${errors.email ? 'error' : ''}`}
                                    placeholder='E-posta adresinizi girin'
                                    disabled={loading}
                                    required
                                />
                            </div>
                            {errors.email && <p className="login-error-message">{errors.email}</p>}
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="password" className="login-form-label">
                                Şifre *
                            </label>
                            <div className="login-input-container">
                                <Lock className="login-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`login-form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Şifrenizi girin"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="login-password-toggle"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="login-error-message">{errors.password}</p>}
                        </div>


                        <div className="login-form-options">
                            <div className="login-remember-me">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="login-checkbox"
                                    disabled={loading}
                                />
                                <label htmlFor="rememberMe" className="login-checkbox-label">
                                    Beni hatırla
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="login-forgot-password"
                                disabled={loading}
                            >
                                Şifremi unuttum
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={`login-submit-button ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-5 h-5" />
                                    Giriş Yap
                                </>
                            )}
                        </button>
                    </form>

                    <div className='login-popup-footer'>
                        <p className='login-footer-text'>
                            Hesabınız yok mu?{' '}
                            <button 
                                className='login-footer-link'
                                onClick={handleRegisterClick}
                                disabled={loading}
                            >
                                Kayıt Ol
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPopUp;