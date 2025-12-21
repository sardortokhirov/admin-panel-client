
import React, { useState, useEffect } from 'react';
import { userPermissionsService } from '../api/userPermissionsService';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import {
    FiCheckCircle,
    FiShield,
    FiUserPlus,
    FiTrash2,
    FiUsers,
    FiChevronLeft,
    FiChevronRight,
    FiSettings,
    FiCheck,
    FiX
} from 'react-icons/fi';

const UserPermissionsPage = () => {
    const [userId, setUserId] = useState('');
    const [canTopUp, setCanTopUp] = useState(true);
    const [canWithdraw, setCanWithdraw] = useState(true);
    const [canBonusTopUp, setCanBonusTopUp] = useState(true);

    const [overrides, setOverrides] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchOverrides = async (pageNumber = 0) => {
        setFetching(true);
        try {
            const response = await userPermissionsService.getAllPermissions(pageNumber, size);
            const data = response.data;
            setOverrides(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setPage(pageNumber);
        } catch (err) {
            console.error("Failed to fetch overrides", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchOverrides(0);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchOverrides(newPage);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError('Iltimos, Foydalanuvchi ID sini kiriting');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await userPermissionsService.savePermissions(userId, {
                canTopUp,
                canWithdraw,
                canBonusTopUp
            });
            setMessage(`Foydalanuvchi [${userId}] huquqlari muvaffaqiyatli saqlandi.`);
            setUserId('');
            setCanTopUp(true);
            setCanWithdraw(true);
            setCanBonusTopUp(true);
            fetchOverrides(page);
        } catch (err) {
            console.error(err);
            setError("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userIdToDelete) => {
        if (!window.confirm(`Haqiqatan ham foydalanuvchi ${userIdToDelete} huquqlarini o'chirib, standart holatga qaytarmoqchimisiz?`)) return;

        try {
            await userPermissionsService.deletePermissions(userIdToDelete);
            fetchOverrides(page);
        } catch (err) {
            console.error(err);
            alert("O'chirishda xatolik yuz berdi");
        }
    };

    const handleEdit = (override) => {
        setUserId(override.userId);
        setCanTopUp(override.canTopUp);
        setCanWithdraw(override.canWithdraw);
        setCanBonusTopUp(override.canBonusTopUp);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="page-container permissions-page">
            <div className="page-header">
                <div className="header-title">
                    <FiSettings className="header-icon" />
                    <h1>Platforma Huquqlari</h1>
                </div>
                <p className="subtitle">Foydalanuvchilar uchun alohida harakatlarni (To'ldirish, Yechish, Bonus) cheklash.</p>
            </div>

            <div className="promo-content">
                <div className="promo-card">
                    <div className="card-header">
                        <FiUserPlus className="card-icon" />
                        <h3>Huquqlarni Sozlash</h3>
                    </div>

                    {message && (
                        <div className="success-message">
                            <FiCheckCircle /> {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="permissions-form">
                        <div className="form-group">
                            <label>Platforma Foydalanuvchi ID</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Foydalanuvchi ID"
                                className="custom-input"
                            />
                        </div>

                        <div className="permissions-grid">
                            <div className="permission-item">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={canTopUp}
                                        onChange={(e) => setCanTopUp(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    To'ldirish (Top-up)
                                </label>
                            </div>
                            <div className="permission-item">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={canWithdraw}
                                        onChange={(e) => setCanWithdraw(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Yechish (Withdraw)
                                </label>
                            </div>
                            <div className="permission-item">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={canBonusTopUp}
                                        onChange={(e) => setCanBonusTopUp(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Bonus To'ldirish
                                </label>
                            </div>
                        </div>

                        <Button primary type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Saqlanmoqda...' : 'Saqlash / Yangilash'}
                        </Button>
                    </form>
                </div>

                <div className="users-list-card">
                    <div className="card-header">
                        <FiUsers className="card-icon" />
                        <h3>Maxsus Huquqlar ({totalElements})</h3>
                    </div>

                    {fetching ? (
                        <Loader />
                    ) : (
                        <>
                            <div className="transaction-list-container">
                                <table className="transaction-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Foydalanuvchi ID</th>
                                            <th>To'ldirish</th>
                                            <th>Yechish</th>
                                            <th>Bonus</th>
                                            <th>Amallar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overrides.length > 0 ? (
                                            overrides.map((item, index) => (
                                                <tr key={item.userId || index}>
                                                    <td>{page * size + index + 1}</td>
                                                    <td className="user-id-cell">{item.userId}</td>
                                                    <td className="status-cell">
                                                        {item.canTopUp ? <FiCheck className="granted" /> : <FiX className="denied" />}
                                                    </td>
                                                    <td className="status-cell">
                                                        {item.canWithdraw ? <FiCheck className="granted" /> : <FiX className="denied" />}
                                                    </td>
                                                    <td className="status-cell">
                                                        {item.canBonusTopUp ? <FiCheck className="granted" /> : <FiX className="denied" />}
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="edit-btn"
                                                            title="Tahrirlash"
                                                        >
                                                            <FiSettings />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.userId)}
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
                                                <td colSpan="6" className="empty-text">Hozircha maxsus huquqlar belgilanmagan.</td>
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

                <div className="info-card">
                    <h3>📢 Eslatma</h3>
                    <p>
                        Agar foydalanuvchi ushbu ro'yxatda bo'lmasa, unga barcha harakatlar <strong>ruxsat berilgan</strong> hisoblanadi.
                    </p>
                    <p>
                        Biror harakatni cheklash uchun foydalanuvchini ro'yxatga qo'shing va tegishli bayroqni o'chiring.
                    </p>
                    <p>
                        <strong>Delete (O'chirish):</strong> Foydalanuvchini ro'yxatdan o'chirish uning barcha huquqlarini standart holatga (ruxsat berilgan) qaytaradi.
                    </p>
                </div>
            </div>

            <style jsx="true">{`
                .permissions-page {
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

                .promo-content {
                    width: 100%;
                }

                .promo-card, .info-card {
                    background: #16213e;
                    border-radius: 12px;
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    margin-bottom: 2rem;
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

                .permissions-form {
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

                .custom-input {
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

                .custom-input:focus {
                    border-color: #e94560;
                    box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
                }

                .permissions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin: 0.5rem 0;
                }

                /* Custom Checkbox */
                .checkbox-container {
                    display: block;
                    position: relative;
                    padding-left: 35px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    user-select: none;
                    color: #cbd5e1;
                }
                .checkbox-container input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                }
                .checkmark {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 22px;
                    width: 22px;
                    background-color: #0f3460;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .checkbox-container:hover input ~ .checkmark {
                    background-color: #1a1a2e;
                }
                .checkbox-container input:checked ~ .checkmark {
                    background-color: #53bf9d;
                    border-color: #53bf9d;
                }
                .checkmark:after {
                    content: "";
                    position: absolute;
                    display: none;
                }
                .checkbox-container input:checked ~ .checkmark:after {
                    display: block;
                }
                .checkbox-container .checkmark:after {
                    left: 7px;
                    top: 3px;
                    width: 5px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 3px 3px 0;
                    transform: rotate(45deg);
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
                    margin-bottom: 2rem;
                }

                .transaction-list-container {
                    width: 100%;
                    overflow-x: auto;
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

                .status-cell {
                    text-align: center;
                    font-size: 1.2rem;
                }
                .granted { color: #53bf9d; }
                .denied { color: #e94560; }

                .actions-cell {
                    display: flex;
                    gap: 0.5rem;
                }

                .edit-btn, .delete-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
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
                .edit-btn:hover {
                    background: rgba(83, 191, 157, 0.2);
                    color: #53bf9d;
                    border-color: #53bf9d;
                }
                .delete-btn {
                    color: #e94560;
                }
                .delete-btn:hover {
                    background: rgba(233, 69, 96, 0.2);
                    border-color: #e94560;
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
    );
};

export default UserPermissionsPage;
