
import React, { useState } from 'react';
import { blockedUsersService } from '../api/blockedUsersService';
import Loader from '../components/common/Loader';
import { FiCheckCircle, FiShield, FiTrash2, FiUsers, FiChevronLeft, FiChevronRight, FiUnlock } from 'react-icons/fi';

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchBlockedUsers = async (pageNumber = 0) => {
        setFetching(true);
        try {
            const response = await blockedUsersService.getAllBlockedUsers(pageNumber, size);
            // Assuming backend returns Page object with content
            const data = response.data;
            setBlockedUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setPage(pageNumber);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
        } finally {
            setFetching(false);
        }
    };

    React.useEffect(() => {
        fetchBlockedUsers(0);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchBlockedUsers(newPage);
        }
    };

    const handleUnblockUser = async (chatId) => {
        if (!window.confirm(`Haqiqatan ham foydalanuvchi ${chatId} ni blokdan chiqarmoqchimisiz?`)) return;

        try {
            await blockedUsersService.unblockUser(chatId);
            setMessage(`Foydalanuvchi [${chatId}] blokdan chiqarildi.`);
            fetchBlockedUsers(page); // Refresh current page list
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            alert("Blokdan chiqarishda xatolik yuz berdi");
        }
    };

    return (
        <div className="page-container promo-page">
            <div className="page-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <h1>Bloklangan Foydalanuvchilar</h1>
                </div>
                <p className="subtitle">Tizim tomonidan bloklangan foydalanuvchilar ro'yxati va ularni boshqarish.</p>
            </div>

            <div className="promo-content">

                {message && (
                    <div className="success-message" style={{ marginBottom: '1rem' }}>
                        <FiCheckCircle /> {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="users-list-card">
                    {fetching ? (
                        <Loader />
                    ) : (
                        <>
                            <div className="transaction-list-container">
                                <table className="transaction-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Chat ID</th>
                                            <th>Bloklangan Vaqt</th>
                                            <th>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blockedUsers.length > 0 ? (
                                            blockedUsers.map((user, index) => (
                                                <tr key={user.id || index}>
                                                    <td>{page * size + index + 1}</td>
                                                    <td className="user-id-cell">{user.chatId}</td>
                                                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleString('uz-UZ') : '-'}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleUnblockUser(user.chatId)}
                                                            className="delete-btn"
                                                            title="Blokdan Chiqarish"
                                                        >
                                                            <FiUnlock />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="empty-text">Hozircha bloklangan foydalanuvchilar yo'q.</td>
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
                                        Sahifa {page + 1} / {totalPages}
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

                    .success-message {
                        background: rgba(83, 191, 157, 0.15);
                        border: 1px solid rgba(83, 191, 157, 0.3);
                        color: #53bf9d;
                        padding: 1rem;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .error-message {
                        background: rgba(233, 69, 96, 0.15);
                        border: 1px solid rgba(233, 69, 96, 0.3);
                        color: #e94560;
                        padding: 1rem;
                        border-radius: 8px;
                        margin-bottom: 1.5rem;
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
                        background: rgba(83, 191, 157, 0.1);
                        border: 1px solid rgba(83, 191, 157, 0.2);
                        color: #53bf9d;
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
                        background: rgba(83, 191, 157, 0.2);
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
                    
                    @media (max-width: 768px) {
                        .transaction-table th, 
                        .transaction-table td {
                            padding: 0.8rem 1rem;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default BlockedUsersPage;
