import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    UserCheck, 
    UserX, 
    Mail, 
    Phone, 
    Calendar, 
    Save, 
    X, 
    Lock, 
    Eye, 
    EyeOff,
    Users,
    Filter,
    Download,
    MoreVertical
} from 'lucide-react';
import UserService from '../services/userService';
import '../css/UsersTab.css';

const UsersTab = ({ externalSearch = '', externalFilters = { onlyActive: false, role: 'all' }, refreshToken = 0, onNotify = () => {}, settings = {} }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        confirmPassword: '',
    });


    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);


    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [refreshToken]);


    useEffect(() => {
        setSearchTerm(externalSearch);
    }, [externalSearch]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersData = await UserService.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
            onNotify({ type: 'error', title: 'Kullanıcılar', message: 'Kullanıcılar yüklenirken hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await UserService.getUserStats();
            setStats(statsData);
        } catch (error) {
            console.error('İstatistikler yüklenirken hata:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePassword = (password) => {
        const policy = settings?.passwordPolicy || { enabled: false };
        if (!policy.enabled) return null;
        const min = policy.minLength ?? 8;
        if ((password || '').length < min) return `Şifre en az ${min} karakter olmalı`;
        if (policy.requireLower && !/[a-z]/.test(password)) return 'En az bir küçük harf içermeli';
        if (policy.requireUpper && !/[A-Z]/.test(password)) return 'En az bir büyük harf içermeli';
        if (policy.requireDigit && !/\d/.test(password)) return 'En az bir rakam içermeli';
        return null;
    };

    const handleAddUser = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            if (!formData.name || !formData.email || !formData.password) {
                onNotify({ type: 'error', title: 'Kullanıcı Ekle', message: 'Ad, email ve şifre zorunludur' });
                return;
            }

            const name = formData.name.trim();
            const email = formData.email.trim().toLowerCase();
            const phone = formData.phone.trim();
            const role = formData.role || 'user';

            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                onNotify({ type: 'error', title: 'Kullanıcı Ekle', message: passwordError });
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                onNotify({ type: 'error', title: 'Kullanıcı Ekle', message: 'Şifreler eşleşmiyor' });
                return;
            }

            const userData = { name, email, phone, role, password: formData.password };

            const newId = await UserService.addUser(userData);
            // Optimistic local update
            setUsers(prev => [{ id: newId, name, email, phone, role, isActive: true, createdAt: new Date() }, ...prev]);
            setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
            setShowAddModal(false);
            setFormData({ name: '', email: '', phone: '', role: 'user', password: '', confirmPassword: '' });
            onNotify({ type: 'success', title: 'Kullanıcı Ekle', message: 'Kullanıcı eklendi' });
            // Sync with server data
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Kullanıcı eklenirken hata:', error);
            onNotify({ type: 'error', title: 'Kullanıcı Ekle', message: 'Kullanıcı eklenemedi' });
        }
    };

    const handleEditUser = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            if (!selectedUser) return;

            if (!formData.name || !formData.email) {
                onNotify({ type: 'error', title: 'Kullanıcı Güncelle', message: 'Ad ve email zorunludur' });
                return;
            }

            if (formData.password) {
                const passwordError = validatePassword(formData.password);
                if (passwordError) {
                    onNotify({ type: 'error', title: 'Kullanıcı Güncelle', message: passwordError });
                    return;
                }

                if (formData.password !== formData.confirmPassword) {
                    onNotify({ type: 'error', title: 'Kullanıcı Güncelle', message: 'Şifreler eşleşmiyor' });
                    return;
                }
            }

            const userData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
            };

            if (formData.password) {
                userData.password = formData.password;
            }

            await UserService.updateUser(selectedUser.id, userData);
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', phone: '', role: 'user', password: '', confirmPassword: '' });
            fetchUsers();
            fetchStats();
            onNotify({ type: 'success', title: 'Kullanıcı Güncelle', message: 'Kullanıcı güncellendi' });
        } catch (error) {
            console.error('Kullanıcı güncellenirken hata:', error);
            onNotify({ type: 'error', title: 'Kullanıcı Güncelle', message: 'Güncelleme başarısız' });
        }
    };

    const handleDeleteUser = async (userId) => {
        const needConfirm = settings?.confirmations?.delete !== false;
        if (needConfirm && !window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            return;
        }
            try {
                await UserService.deleteUser(userId);
                fetchUsers();
                fetchStats();
            onNotify({ type: 'success', title: 'Kullanıcı Sil', message: 'Kullanıcı silindi' });
            } catch (error) {
                console.error('Kullanıcı silinirken hata:', error);
            onNotify({ type: 'error', title: 'Kullanıcı Sil', message: 'Silme başarısız' });
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await UserService.toggleUserStatus(userId, !currentStatus);
            fetchUsers();
            fetchStats();
            onNotify({ type: 'success', title: 'Durum', message: `Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} yapıldı` });
        } catch (error) {
            console.error('Kullanıcı durumu değiştirilirken hata:', error);
            onNotify({ type: 'error', title: 'Durum', message: 'Durum değiştirilemedi' });
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'user',
            password: '',
            confirmPassword: '',
        });
        setShowEditModal(true);
    };

    const closeModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ name: '', email: '', phone: '', role: 'user', password: '', confirmPassword: '' });
        setShowPassword(false);
        setShowConfirmPassword(false);
    };


    const filteredUsers = users
        .filter(user => {
            const query = (searchTerm || '').toLowerCase();
            const matchesText = user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
            const matchesActive = !externalFilters.onlyActive || !!user.isActive;
            const matchesRole = externalFilters.role === 'all' || (user.role || 'user') === externalFilters.role;
            return matchesText && matchesActive && matchesRole;
        });

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Bilinmiyor';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="users-tab">

            <div className="users-header">
                <div className="header-left">
                    <Users size={24} />
                    <div>
                        <h2>Kullanıcı Yönetimi</h2>
                        <p>Platform kullanıcılarınızı yönetin ve izleyin</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Filter size={16} />
                        Filtrele
                    </button>
                    <button className="btn-secondary">
                        <Download size={16} />
                        Dışa Aktar
                    </button>
                </div>
            </div>


            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">Toplam Kullanıcı</div>
                        <div className="progress-bar">
                            <div className="progress-fill blue" style={{width: '100%'}}></div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.active}</div>
                        <div className="stat-label">Aktif Kullanıcı</div>
                        <div className="progress-bar">
                            <div className="progress-fill green" style={{width: stats.total > 0 ? `${(stats.active/stats.total)*100}%` : '0%'}}></div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <UserX size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.inactive}</div>
                        <div className="stat-label">Pasif Kullanıcı</div>
                        <div className="progress-bar">
                            <div className="progress-fill orange" style={{width: stats.total > 0 ? `${(stats.inactive/stats.total)*100}%` : '0%'}}></div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="users-table-section">
                <div className="table-header">
                    <div className="table-title">
                        <h3>Tüm Kullanıcılar</h3>
                        <span className="user-count">{filteredUsers.length} kullanıcı</span>
                    </div>
                    <div className="table-actions">
                        <div className="search-container">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Kullanıcı ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button 
                            className="btn-primary add-user-btn"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16} />
                            Kullanıcı Ekle
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Kullanıcılar yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <div className="table-grid-header">
                                <div className="table-cell">Kullanıcı</div>
                                <div className="table-cell">İletişim</div>
                                <div className="table-cell">Rol</div>
                                <div className="table-cell">Durum</div>
                                <div className="table-cell">Oluşturulma</div>
                                <div className="table-cell">Eylemler</div>
                            </div>
                            
                            {filteredUsers.map(user => (
                                <div key={user.id} className="table-row">
                                    <div className="table-cell">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-id">ID: {user.id?.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <div className="contact-info">
                                            <div className="contact-item">
                                                <Mail size={14} />
                                                {user.email}
                                            </div>
                                            <div className="contact-item">
                                                <Phone size={14} />
                                                {user.phone || 'Belirtilmemiş'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                        </span>
                                    </div>
                                    <div className="table-cell">
                                        <button
                                            className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                        >
                                            {user.isActive ? <UserCheck size={14} /> : <UserX size={14} />}
                                            {user.isActive ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </div>
                                    <div className="table-cell">
                                        <div className="date-info">
                                            <Calendar size={14} />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button className="action-btn more">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <Users size={48} />
                            <h3>Kullanıcı bulunamadı</h3>
                            <p>Arama kriterlerinize uygun kullanıcı bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>


            {showAddModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Kullanıcı Ekle</h3>
                            <button className="modal-close" onClick={closeModals}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ad Soyad</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="user">Kullanıcı</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Şifre</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <small>Şifrenizi belirleyin</small>
                                </div>
                                <div className="form-group">
                                    <label>Şifre (Tekrar)</label>
                                    <div className="password-input">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModals}>İptal</button>
                                <button type="button" className="btn-primary" onClick={handleAddUser}>
                                    <Save size={16} /> Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {showEditModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Kullanıcı Düzenle</h3>
                            <button className="modal-close" onClick={closeModals}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleEditUser}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ad Soyad</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="user">Kullanıcı</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Yeni Şifre (opsiyonel)</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Yeni Şifre (Tekrar)</label>
                                    <div className="password-input">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModals}>İptal</button>
                                <button type="button" className="btn-primary" onClick={handleEditUser}>
                                    <Save size={16} /> Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTab;