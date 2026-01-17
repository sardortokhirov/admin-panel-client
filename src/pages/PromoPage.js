
import React, { useState } from 'react';
import { promoService } from '../api/promoService';
import { setAuthHeader } from '../api/apiService';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FiCheckCircle, FiShield, FiUserPlus, FiTrash2, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PromoPage = () => {
    // User ID State
    const [userId, setUserId] = useState('');
    const [allowedUsers, setAllowedUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Chat ID State
    const [chatId, setChatId] = useState('');
    const [allowedChats, setAllowedChats] = useState([]);
    const [chatPage, setChatPage] = useState(0);
    const [chatTotalPages, setChatTotalPages] = useState(0);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchAllowedUsers = async (pageNumber = 0) => {
        setFetching(true);
        try {
            const response = await promoService.getAllPromoUsers(pageNumber, size);
            const data = response.data;
            setAllowedUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setPage(pageNumber);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setFetching(false);
        }
    };

    const fetchAllowedChats = async (pageNumber = 0) => {
        try {
            const response = await promoService.getAllPromoChats(pageNumber, size);
            const data = response.data;
            setAllowedChats(data.content || []);
            setChatTotalPages(data.totalPages || 0);
            setChatPage(pageNumber);
        } catch (err) {
            console.error("Failed to fetch chats", err);
        }
    };

    React.useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchAllowedUsers(0);
        fetchAllowedChats(0);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchAllowedUsers(newPage);
        }
    };

    const handleChatPageChange = (newPage) => {
        if (newPage >= 0 && newPage < chatTotalPages) {
            fetchAllowedChats(newPage);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        // Determine is this is a user ID or chat ID add based on the active input or tab?
        // Let's assume we handle them separately in the UI
        if (!userId) return;

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await promoService.addPromoUser(userId);
            setMessage(`Foydalanuvchi [${userId}] muvaffaqiyatli qo'shildi.`);
            setUserId('');
            fetchAllowedUsers(page);
        } catch (err) {
            console.error(err);
            setError("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddChat = async (e) => {
        e.preventDefault();
        if (!chatId) {
            setError('Iltimos, Telegram Chat ID sini kiriting');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await promoService.addPromoChat(chatId);
            setMessage(`Chat ID [${chatId}] muvaffaqiyatli qo'shildi.`);
            setChatId('');
            fetchAllowedChats(chatPage);
        } catch (err) {
            console.error(err);
            setError("Chat ID qo'shishda xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (idToRemove) => {
        if (!window.confirm(`Haqiqatan ham foydalanuvchi ${idToRemove} ni o'chirmoqchimisiz?`)) return;

        try {
            await promoService.removePromoUser(idToRemove);
            fetchAllowedUsers(page);
        } catch (err) {
            console.error(err);
            alert("O'chirishda xatolik yuz berdi");
        }
    };

    const handleRemoveChat = async (idToRemove) => {
        if (!window.confirm(`Haqiqatan ham Chat ID ${idToRemove} ni o'chirmoqchimisiz?`)) return;

        try {
            await promoService.removePromoChat(idToRemove);
            fetchAllowedChats(chatPage);
        } catch (err) {
            console.error(err);
            alert("O'chirishda xatolik yuz berdi");
        }
    };

    return (
        <div className="page-container promo-page">
            <div className="page-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <h1>Promo Whitelist</h1>
                </div>
                <p className="subtitle">Promo rejimi yoqilgan paytda foydalanuvchilarga pul yechishga ruxsat berish.</p>
            </div>

            <div className="promo-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* --- Left Column: Platform Users --- */}
                <div className="promo-column">
                    <div className="promo-card">
                        <div className="card-header">
                            <FiUserPlus className="card-icon" />
                            <h3>Platforma Foydalanuvchi ID</h3>
                        </div>

                        <form onSubmit={handleAddUser} className="promo-form">
                            <div className="form-group row">
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Foydalanuvchi ID"
                                    className="custom-input flex-grow"
                                />
                                <Button primary type="submit" disabled={loading} className="submit-btn-inline">
                                    {loading ? '...' : 'Qo\'shish'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="users-list-card">
                        <div className="list-header" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4>Ruxsat etilgan IDlar</h4>
                        </div>
                        {fetching ? (
                            <Loader />
                        ) : (
                            <>
                                <div className="transaction-list-container">
                                    <table className="transaction-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allowedUsers.length > 0 ? (
                                                allowedUsers
                                                    .filter(user => user.userId) // Filter out null userIds
                                                    .map((user, index) => (
                                                        <tr key={user.id || index}>
                                                            <td className="user-id-cell">{user.userId}</td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleRemoveUser(user.userId)}
                                                                    className="delete-btn"
                                                                    title="O'chirish"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="empty-text">Ro'yxat bo'sh</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 0}
                                            className="pagination-btn"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        <span className="page-info">
                                            {page + 1} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages - 1}
                                            className="pagination-btn"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Telegram Chat IDs --- */}
                <div className="promo-column">
                    <div className="promo-card">
                        <div className="card-header">
                            <FiUsers className="card-icon" />
                            <h3>Telegram Chat ID</h3>
                        </div>

                        <form onSubmit={handleAddChat} className="promo-form">
                            <div className="form-group row">
                                <input
                                    type="text"
                                    value={chatId}
                                    onChange={(e) => setChatId(e.target.value)}
                                    placeholder="Telegram Chat ID"
                                    className="custom-input flex-grow"
                                />
                                <Button primary type="submit" disabled={loading} className="submit-btn-inline">
                                    {loading ? '...' : 'Qo\'shish'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="users-list-card">
                        <div className="list-header" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4>Ruxsat etilgan Chatlar</h4>
                        </div>
                        {fetching ? (
                            <Loader />
                        ) : (
                            <>
                                <div className="transaction-list-container">
                                    <table className="transaction-table">
                                        <thead>
                                            <tr>
                                                <th>Chat ID</th>
                                                <th>Amallar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allowedChats.length > 0 ? (
                                                allowedChats
                                                    .filter(chat => chat.chatId) // Filter out null chatIds
                                                    .map((chat, index) => (
                                                        <tr key={chat.id || index}>
                                                            <td className="user-id-cell">{chat.chatId}</td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleRemoveChat(chat.chatId)}
                                                                    className="delete-btn"
                                                                    title="O'chirish"
                                                                >
                                                                    <FiTrash2 />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="empty-text">Ro'yxat bo'sh</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {chatTotalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => handleChatPageChange(chatPage - 1)}
                                            disabled={chatPage === 0}
                                            className="pagination-btn"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        <span className="page-info">
                                            {chatPage + 1} / {chatTotalPages}
                                        </span>
                                        <button
                                            onClick={() => handleChatPageChange(chatPage + 1)}
                                            disabled={chatPage === chatTotalPages - 1}
                                            className="pagination-btn"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="promo-content">
                {/* Shared Message/Error Area */}
                {message && (
                    <div className="success-message" style={{ marginTop: '1rem' }}>
                        <FiCheckCircle /> {message}
                    </div>
                )}

                {error && (
                    <div className="error-message" style={{ marginTop: '1rem' }}>
                        {error}
                    </div>
                )}

                <div className="info-card" style={{ marginTop: '2rem' }}>
                    <h3>📢 Eslatma</h3>
                    <p>
                        Ushbu bo'lim faqat <strong>Promo Rejimi</strong> yoqilgan holatda ishlatiladi.
                        Agar promo rejimi o'chiq bo'lsa, barcha foydalanuvchilar bemalol pul yechishlari mumkin.
                    </p>
                    <p>
                        <strong>Foydalanuvchi ID:</strong> Platformadagi ichki ID raqami. <br />
                        <strong>Telegram Chat ID:</strong> Foydalanuvchining Telegram akkaunti unikal ID raqami. <br />
                        Pul yechish uchun foydalanuvchi har ikki ro'yxatda ham bo'lishi talab qilinishi mumkin (tizim sozlamalariga qarab).
                    </p>
                </div>
            </div>

            <style jsx="true">{`
                .promo-page {
                    color: #fff;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .page-header {
                    margin-bottom: 2rem;
                }
                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }
                .header-icon {
                    font-size: 2rem;
                    color: #e94560;
                }
                .header-title h1 {
                    font-size: 1.8rem;
                    margin: 0;
                }
                .subtitle {
                    color: #a0a0a0;
                    margin: 0;
                }

                .promo-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    width: 100%;
                }

                .promo-column {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    min-width: 0; /* Ensures grid item doesn't overflow */
                }

                .promo-card {
                    background: #16213e;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    /* Margin bottom is no longer needed on the card itself inside the column flex layout */
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .form-group.row {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                
                .flex-grow {
                    flex: 1;
                }
                
                .submit-btn-inline {
                    padding: 0.8rem 1.5rem;
                    font-size: 1rem;
                    border-radius: 8px;
                    white-space: nowrap;
                }

                .promo-card, .info-card {
                    background: #16213e;
                    border-radius: 12px;
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 1rem;
                }
                .card-icon {
                    font-size: 1.5rem;
                    color: #53bf9d;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                }

                .promo-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #a0a0a0;
                    font-size: 0.9rem;
                }

                .custom-input, .custom-select {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: #0f3460;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                }

                .custom-input:focus, .custom-select:focus {
                    border-color: #e94560;
                    box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
                }

                .submit-btn {
                    margin-top: 1rem;
                    padding: 1rem;
                    font-size: 1rem;
                    border-radius: 8px;
                }

                .success-message {
                    background: rgba(83, 191, 157, 0.15);
                    border: 1px solid rgba(83, 191, 157, 0.3);
                    color: #53bf9d;
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                }

                .error-message {
                    background: rgba(233, 69, 96, 0.15);
                    border: 1px solid rgba(233, 69, 96, 0.3);
                    color: #e94560;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }

                .info-card h3 {
                    color: #e94560;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .info-card p {
                    color: #cbd5e1;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }
                .info-card strong {
                    color: #fff;
                }

                .promo-content {
                    width: 100%;
                }

                .users-list-card {
                    background: #16213e;
                    border-radius: 12px;
                    padding: 0;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    margin-top: 2rem;
                }

                .transaction-list-container {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .transaction-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 0.95rem;
                }

                .transaction-table th,
                .transaction-table td {
                    padding: 1rem 1.5rem;
                    color: #fff;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .transaction-table th {
                    background: rgba(15, 52, 96, 0.5);
                    color: #a0a0a0;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .transaction-table tbody tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .user-id-cell {
                    font-family: 'Roboto Mono', monospace;
                    color: #e94560;
                }

                .delete-btn {
                    background: rgba(233, 69, 96, 0.1);
                    border: 1px solid rgba(233, 69, 96, 0.2);
                    color: #e94560;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                }
                .delete-btn:hover {
                    background: rgba(233, 69, 96, 0.2);
                    transform: scale(1.05);
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    background: #16213e;
                }

                .pagination-btn {
                    background: #0f3460;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    padding: 0.5rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .pagination-btn:hover:not(:disabled) {
                    background: #1a1a2e;
                    border-color: #53bf9d;
                    color: #53bf9d;
                }

                .pagination-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .page-info {
                    color: #a0a0a0;
                    font-size: 0.9rem;
                }

                .empty-text {
                    color: #a0a0a0;
                    text-align: center;
                    padding: 3rem;
                    font-style: italic;
                }
                
                @media (max-width: 900px) {
                    .promo-layout-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .promo-content {
                        grid-template-columns: 1fr;
                    }
                    .transaction-table th, 
                    .transaction-table td {
                        padding: 0.8rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PromoPage;
