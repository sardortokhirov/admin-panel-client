
import React, { useState, useEffect, useCallback } from 'react';
import { lotteryService } from '../api/lotteryService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaTrash } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiHash, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UsersPage = () => {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState('balance');
    const [sortDirection, setSortDirection] = useState('DESC');
    const [pageData, setPageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [overallStats, setOverallStats] = useState(null);

    const fetchBalances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await lotteryService.getUserBalancesPaginated(page, size, sortBy, sortDirection);
            setPageData(response.data);
            setSelectedIds([]);
        } catch (err) {
            setError("Foydalanuvchi balansi ma'lumotlarini yuklashda xatolik. Ulanishni tekshiring.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [page, size, sortBy, sortDirection]);

    const fetchOverallStats = useCallback(async () => {
        try {
            const response = await lotteryService.getOverallStats();
            setOverallStats(response.data);
        } catch (err) {
            console.error("Failed to fetch overall stats:", err);
        }
    }, []);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchBalances();
        fetchOverallStats();
    }, [fetchBalances, fetchOverallStats]);

    // --- Actions ---

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(newSortBy);
            setSortDirection('DESC');
        }
        setPage(0);
    };

    // Ommaviy amal uchun joy (TransactionsPage'dagi kabi)
    const handleBulkAction = () => {
        if (selectedIds.length === 0) {
            alert("Iltimos, amal bajarish uchun foydalanuvchilarni tanlang.");
            return;
        }
        alert(`Tanlangan ${selectedIds.length} ta foydalanuvchi ustida amal bajarish (Masalan: Balansni O'chirish)`);
    };

    // Tanlash logikasi
    const handleSelect = (chatId) => {
        setSelectedIds(prev => prev.includes(chatId) ? prev.filter(i => i !== chatId) : [...prev, chatId]);
    };

    const handleSelectAll = (e) => {
        if (!pageData) return;
        if (e.target.checked) {
            setSelectedIds(pageData.content.map(u => u.chatId));
        } else {
            setSelectedIds([]);
        }
    };

    // --- Helpers ---

    const formatCurrency = (amount) => {
        // Balans har doim 2-ustun ma'lumoti, tickets 3-ustun ma'lumoti hisoblanadi (checkbox bilan 4-ustun)
        return Number(amount).toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 });
    };

    const PaginationControls = () => {
        if (!pageData || pageData.totalPages <= 1) return null;

        const { number, totalPages, first, last } = pageData;
        const currentPage = number + 1;

        return (
            <div className="pagination-controls">
                <Button
                    onClick={() => setPage(number - 1)}
                    disabled={first || isLoading}
                    secondary
                >
                    <FiChevronLeft /> Oldingi
                </Button>
                <span>Sahifa <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Jami: {pageData.totalElements.toLocaleString()} ta)</span>
                <Button
                    onClick={() => setPage(number + 1)}
                    disabled={last || isLoading}
                    secondary
                >
                    Keyingi <FiChevronRight />
                </Button>
            </div>
        );
    };

    const totalUsersOnPage = pageData ? pageData.content.length : 0;

    // --- Render ---

    if (isLoading && !pageData) return <Loader />;

    return (
        <div className="page-container users-page">
            <div className="page-header">
                <h1>Foydalanuvchi Balanslari</h1>
                <Link to="/lottery">
                    <Button secondary>Lotereya Sahifasiga Qaytish</Button>
                </Link>
            </div>
            {overallStats && (
                <div className="header-stats-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div className="stat-item">
                        <span style={{ color: '#a0a0a0', marginRight: '10px' }}>Jami Balans:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#53bf9d' }}>
                            {overallStats.totalBalance?.toLocaleString('uz-UZ')} UZS
                        </span>
                    </div>
                    <div className="stat-item">
                        <span style={{ color: '#a0a0a0', marginRight: '10px' }}>Jami Biletlar:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e94560' }}>
                            {overallStats.totalTickets?.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            <div className="table-actions">
                {selectedIds.length > 0 && (
                    <Button danger onClick={handleBulkAction}>
                        <FaTrash /> Tanlangan {selectedIds.length} tasida Amal Bajarish
                    </Button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
                // Removed 'balance-table-container' class
                <div className="transaction-list-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={totalUsersOnPage > 0 && selectedIds.length === totalUsersOnPage}
                                        disabled={totalUsersOnPage === 0}
                                    />
                                </th>
                                <th onClick={() => handleSort('chatId')} className={sortBy === 'chatId' ? 'active-sort' : ''}>
                                    <FiHash /> Chat ID {sortBy === 'chatId' && (sortDirection === 'ASC' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('balance')} className={sortBy === 'balance' ? 'active-sort' : ''}>
                                    <FiTrendingUp /> Balans {sortBy === 'balance' && (sortDirection === 'ASC' ? '▲' : '▼')}
                                </th>
                                <th onClick={() => handleSort('tickets')} className={sortBy === 'tickets' ? 'active-sort' : ''}>
                                    <FiCreditCard /> Biletlar {sortBy === 'tickets' && (sortDirection === 'ASC' ? '▲' : '▼')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.content.length > 0 ? (
                                pageData.content.map((user) => (
                                    <tr key={user.chatId} className={selectedIds.includes(user.chatId) ? 'selected' : ''}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(user.chatId)}
                                                onChange={() => handleSelect(user.chatId)}
                                            />
                                        </td>
                                        <td>{user.chatId}</td>
                                        <td>{formatCurrency(user.balance)}</td>
                                        <td>{user.tickets.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">Foydalanuvchi balanslari topilmadi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <PaginationControls />
        </div>
    );
};

export default UsersPage;