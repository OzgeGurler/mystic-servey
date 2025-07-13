import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, UserCheck, UserX, Mail, Phone, Calendar, Save, X } from 'lucide-react';
import UserService from '../services/userService';
import '../css/UsersTab.css';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
    });

    // Sayfa yüklendiğinde kullanıcıları getir
    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersData = await UserService.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
            alert('Kullanıcılar yüklenirken bir hata oluştu!');
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

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            if (!formData.name || !formData.email) {
                alert('Ad ve email alanları zorunludur!');
                return;
            }
            await UserService.addUser(formData);
            setShowAddModal(false);
            setFormData({ name: '', email: '', phone: '', role: 'user' });
            fetchUsers();
            fetchStats();
            alert('Kullanıcı başarıyla eklendi!');
        } catch (error) {
            console.error('Kullanıcı eklenirken hata:', error);
            alert('Kullanıcı eklenirken bir hata oluştu!');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            if (!selectedUser) return;

            await UserService.updateUser(selectedUser.id, formData);
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', phone: '', role: 'user' });
            fetchUsers();
            fetchStats();
            alert('Kullanıcı başarıyla güncellendi!');
        } catch (error) {
            console.error('Kullanıcı güncellenirken hata:', error);
            alert('Kullanıcı güncellenirken bir hata oluştu!');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            try {
                await UserService.deleteUser(userId);
                fetchUsers();
                fetchStats();
                alert('Kullanıcı başarıyla silindi!');
            } catch (error) {
                console.error('Kullanıcı silinirken hata:', error);
                alert('Kullanıcı silinirken bir hata oluştu!');
            }
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await UserService.toggleUserStatus(userId, !currentStatus);
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Kullanıcı durumu değiştirilirken hata:', error);
            alert('Kullanıcı durumu değiştirilirken bir hata oluştu!');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'user',
        });
        setShowEditModal(true);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Bilinmiyor';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="users-tab">
            <div className="tab-content">
                <div className="users-header">
                    <h2>Kullanıcı Yönetimi</h2>
                    <button
                        className="add-user-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus className="icon" />
                        Yeni Kullanıcı Ekle
                    </button>
                </div>

                {/* İstatistikler */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">Toplam Kullanıcı</div>
                    </div>
                    <div className="stat-card active">
                        <div className="stat-number">{stats.active}</div>
                        <div className="stat-label">Aktif Kullanıcı</div>
                    </div>
                    <div className="stat-card inactive">
                        <div className="stat-number">{stats.inactive}</div>
                        <div className="stat-label">Pasif Kullanıcı</div>
                    </div>
                </div>

                {/* Arama */}
                <div className="search-container">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Kullanıcı Tablosu */}
                <div className="users-table-container">
                    {loading ? (
                        <div className="loading">Yükleniyor...</div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Ad</th>
                                        <th>Email</th>
                                        <th>Telefon</th>
                                        <th>Rol</th>
                                        <th>Durum</th>
                                        <th>Oluşturma Tarihi</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="user-name">{user.name}</td>
                                            <td className="user-email">
                                                <div className="cell-content">
                                                    <Mail className="icon" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="user-phone">
                                                <div className="cell-content">
                                                    <Phone className="icon" />
                                                    {user.phone || 'Belirtilmemiş'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                                                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                                                >
                                                    {user.isActive ? <UserCheck className="icon" /> : <UserX className="icon" />}
                                                    {user.isActive ? 'Aktif' : 'Pasif'}
                                                </button>
                                            </td>
                                            <td className="user-date">
                                                <div className="cell-content">
                                                    <Calendar className="icon" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td className="actions">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    <Edit className="icon" />
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <Trash2 className="icon" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


                {/* Kullanıcı Ekle Modal */}
                {showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Yeni Kullanıcı Ekle</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <X className="icon" />
                                </button>
                            </div>
                            <form onSubmit={handleAddUser}>
                                <div className="form-group">
                                    <label>Ad Soyad *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="user">Kullanıcı</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowAddModal(false)}>
                                        İptal
                                    </button>
                                    <button type="submit" className="save-btn">
                                        <Save className="icon" />
                                        Kaydet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Kullanıcı Düzenleme Modal */}
                {showEditModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Kullanıcı Düzenle</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    <X className="icon" />
                                </button>
                            </div>
                            <form onSubmit={handleEditUser}>
                                <div className="form-group">
                                    <label>Ad Soyad *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Telefon</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rol</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="user">Kullanıcı</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowEditModal(false)}>
                                        İptal
                                    </button>
                                    <button type="submit" className="save-btn">
                                        <Save className="icon" />
                                        Güncelle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersTab;

