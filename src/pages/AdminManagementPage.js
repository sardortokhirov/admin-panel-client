import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiUserCheck, FiTrash2, FiBell, FiBellOff, FiPlus } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminManagementPage = () => {
    // State for the list of admins
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the "Add Admin" form
    const [newChatId, setNewChatId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const fetchAdmins = async () => {
        try {
            const response = await adminService.getAdminChats();
            setAdmins(response.data);
        } catch (err) {
            setError('Adminlar roʻyxatini yuklashda xatolik.'); // Translated
            toast.error('Adminlar roʻyxatini yuklashda xatolik.'); // Translated
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchAdmins();
    }, []);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!newChatId.trim()) {
            toast.warn('Iltimos, Chat ID kiriting.'); // Translated
            return;
        }
        setIsAdding(true);
        try {
            await adminService.createAdminChat(newChatId);
            toast.success('Admin muvaffaqiyatli qoʻshildi!'); // Translated
            setNewChatId(''); // Clear the input field
            await fetchAdmins(); // Refresh the list to show the new admin
        } catch (err) {
            toast.error('Admin qoʻshishda xatolik. U allaqachon mavjud boʻlishi mumkin.'); // Translated
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggle = async (chatId, currentStatus) => {
        const newStatus = !currentStatus;
        setAdmins(admins.map(admin => admin.chatId === chatId ? { ...admin, receiveNotifications: newStatus } : admin));
        try {
            await adminService.updateNotificationStatus(chatId, newStatus);
            // Translated
            toast.success(`Bildirishnomalar ${newStatus ? 'yoqildi' : 'oʻchirildi'}.`);
        } catch (err) {
            setAdmins(admins.map(admin => admin.chatId === chatId ? { ...admin, receiveNotifications: currentStatus } : admin));
            toast.error('Holatni yangilashda xatolik.'); // Translated
        }
    };

    const handleDelete = async (chatId) => {
        // Translated
        if (window.confirm('Haqiqatan ham ushbu adminni oʻchirmoqchimisiz?')) {
            try {
                await adminService.deleteAdminChat(chatId);
                setAdmins(admins.filter(admin => admin.chatId !== chatId));
                toast.success('Admin oʻchirildi.'); // Translated
            } catch (err) {
                toast.error('Adminni oʻchirishda xatolik.'); // Translated
            }
        }
    };

    return (
        <div className="page-container admin-management-page">
            <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
            <div className="page-header">
                <h1>Adminlarni Boshqarish</h1> {/* Translated */}
            </div>

            {/* Panel for adding new admins */}
            <div className="add-admin-panel">
                <h3>Yangi Admin Qo'shish</h3> {/* Translated */}
                <form onSubmit={handleAddAdmin} className="add-admin-form">
                    <div className="form__group">
                        <label htmlFor="newChatId">Telegram Chat ID</label> {/* Kept in English for technical clarity */}
                        <input
                            type="number"
                            id="newChatId"
                            value={newChatId}
                            onChange={(e) => setNewChatId(e.target.value)}
                            placeholder="Foydalanuvchining raqamli Chat ID'sini kiriting" // Translated
                            disabled={isAdding}
                        />
                    </div>
                    <Button type="submit" primary disabled={isAdding}>
                        <FiPlus /> {isAdding ? 'Qoʻshilmoqda...' : 'Admin Qoʻshish'} {/* Translated */}
                    </Button>
                </form>
            </div>

            {/* List of existing admins */}
            <div className="admin-list-container">
                {isLoading ? <Loader /> : error ? <p className="error-message">{error}</p> : (
                    <div className="admin-list">
                        {admins.length > 0 ? admins.map(admin => (
                            <div key={admin.chatId} className="admin-item">
                                <div className="admin-info">
                                    <FiUserCheck className="admin-icon" />
                                    <div>
                                        <span className="admin-name">Admin Chat ID</span> {/* Kept in English */}
                                        <span className="admin-chat-id">{admin.chatId}</span>
                                    </div>
                                </div>
                                <div className="admin-actions">
                                    {admin.receiveNotifications ? <FiBell className="status-icon enabled" /> : <FiBellOff className="status-icon disabled" />}
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={admin.receiveNotifications}
                                            onChange={() => handleToggle(admin.chatId, admin.receiveNotifications)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <button className="delete-btn" onClick={() => handleDelete(admin.chatId)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="no-data">Hozircha adminlar qoʻshilmagan.</p> // Translated
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManagementPage;