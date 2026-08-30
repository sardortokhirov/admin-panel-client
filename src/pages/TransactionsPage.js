import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../api/transactionService';
import { cardService } from '../api/cardService';
import { platformService } from '../api/platformService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { STATUS_MAP, TRANSACTION_TYPE_MAP, getStatusInfo, getTypeInfo } from '../constants/statusConstants';
import { FaTrash, FaFilter, FaTimes, FaSpinner, FaTimesCircle, FaImage, FaCoins, FaWallet, FaExchangeAlt, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const requestStatuses = [
    "PENDING",
    "PENDING_SMS",
    "PENDING_ADMIN",
    "APPROVED",
    "BONUS_APPROVED",
    "CANCELED",
    "PENDING_PAYMENT",
    "FAILED",
    "PENDING_SCREENSHOT",
    "PROCESSING",
    "USER_CANCELED"
];
const requestTypes = ["TOP_UP", "WITHDRAWAL", "TIP", "WALLET_DEPOSIT", "WALLET_WITHDRAWAL", "WALLET_TO_PLATFORM", "WALLET_TO_WALLET", "TICKET_TRADE"];

const TransactionsPage = () => {
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [cards, setCards] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // State for mobile filter panel

    const [filters, setFilters] = useState({
        cardId: '',
        platformId: '',
        status: '',
        type: '',
    });

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await transactionService.getTransactions(filters);
            setTransactions(response.data);
            setSelectedIds([]);
        } catch (err) {
            setError('Tranzaksiyalarni yuklashda xatolik. Ulanish yoki filtrlarni tekshiring.'); // Translated
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [cardsRes, platformsRes] = await Promise.all([
                    cardService.getCards(),
                    platformService.getPlatforms(),
                ]);
                setCards(cardsRes.data);
                setPlatforms(platformsRes.data.map(p => ({ id: p.id, name: p.name })));
            } catch (err) {
                console.error("Filtr ma'lumotlarini yuklashda xato", err); // Translated
                setError("Filtrlar uchun ma'lumotlarni yuklab bo'lmadi."); // Translated
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
        fetchTransactions();

    }, [isAuthenticated, fetchTransactions]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleApplyFilters = () => {
        fetchTransactions();
        setIsFilterPanelOpen(false); // Close panel on mobile after applying
    };

    const handleClearFilters = () => {
        setFilters({ cardId: '', platformId: '', status: '', type: '' });
        // The component will re-fetch automatically because fetchTransactions is a dependency of useEffect
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(transactions.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Haqiqatan ham #${id} raqamli tranzaksiyani oʻchirmoqchimisiz?`)) { // Translated
            try {
                await transactionService.deleteTransaction(id);
                fetchTransactions();
            } catch (err) {
                alert(`#${id} raqamli tranzaksiyani oʻchirishda xatolik.`); // Translated
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) {
            alert('Iltimos, oʻchirish uchun tranzaksiyalarni tanlang.'); // Translated
            return;
        }
        if (window.confirm(`Haqiqatan ham tanlangan ${selectedIds.length} ta tranzaksiyani oʻchirmoqchimisiz?`)) { // Translated
            try {
                await transactionService.deleteBulkTransactions(selectedIds);
                fetchTransactions();
            } catch (err) {
                alert('Tanlangan tranzaksiyalarni oʻchirishda xatolik.'); // Translated
            }
        }
    };

    const TypeBadge = ({ type }) => {
        const info = getTypeInfo(type);
        return (
            <span style={{ color: info.color, display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                {info.icon}
                {info.label}
            </span>
        );
    };

    const StatusBadge = ({ status }) => {
        const info = getStatusInfo(status);
        return (
            <span className={`status-badge-v2 ${info.className}`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: `${info.color}15`,
                color: info.color,
                border: `1px solid ${info.color}30`
            }}>
                {info.icon} {info.label}
            </span>
        );
    };

    return (
        <div className="page-container transactions-page">
            <div className="page-header">
                <h1>Tranzaksiyalar Jurnali</h1> {/* Translated */}
                <button className="mobile-filter-toggle" onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}>
                    <FaFilter /> Filtrlar
                </button>
            </div>

            <div className={`filter-panel ${isFilterPanelOpen ? 'open' : ''}`}>
                <div className="filter-grid">
                    <select name="cardId" value={filters.cardId} onChange={handleFilterChange}>
                        <option value="">Barcha Kartalar</option> {/* Translated */}
                        {cards.map(card => <option key={card.id} value={card.id}>{card.ownerName} - ...{card.cardNumber.slice(-4)}</option>)}
                    </select>
                    <select name="platformId" value={filters.platformId} onChange={handleFilterChange}>
                        <option value="">Barcha Platformalar</option> {/* Translated */}
                        {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">Barcha Statuslar</option>
                        {Object.entries(STATUS_MAP).map(([key, info]) => (
                            <option key={key} value={key}>{info.label}</option>
                        ))}
                    </select>
                    <select name="type" value={filters.type} onChange={handleFilterChange}>
                        <option value="">Barcha Turlar</option>
                        {Object.entries(TRANSACTION_TYPE_MAP).map(([key, info]) => (
                            <option key={key} value={key}>{info.label}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-actions">
                    <Button primary onClick={handleApplyFilters}><FaFilter /> Filtrlarni Qoʻllash</Button> {/* Translated */}
                    <Button onClick={handleClearFilters}><FaTimes /> Filtrlarni Tozalash</Button> {/* Translated */}
                </div>
            </div>

            <div className="table-actions">
                {selectedIds.length > 0 && (
                    <Button danger onClick={handleBulkDelete}>
                        <FaTrash /> Oʻchirish ({selectedIds.length}) {/* Translated */}
                    </Button>
                )}
            </div>

            {isLoading && <Loader />}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && (
                <div className="transaction-list-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" onChange={handleSelectAll} checked={transactions.length > 0 && selectedIds.length === transactions.length} /></th>
                                <th>ID</th>
                                <th>Platforma</th>
                                <th>Foydalanuvchi</th>
                                <th>Karta</th>
                                <th>Miqdor</th>
                                <th>Tur</th>
                                <th>Status</th>
                                <th>Sana</th>
                                <th>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? transactions.map(t => (
                                <tr key={t.id} className={selectedIds.includes(t.id) ? 'selected' : ''}>
                                    <td><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => handleSelect(t.id)} /></td>
                                    <td>{t.id}</td>
                                    <td>{t.platform}</td>
                                    <td>{t.fullName || `ChatID: ${t.chatId}`}</td>
                                    <td>...{t.cardNumber?.slice(-4)}</td>
                                    <td>{t.uniqueAmount}</td>
                                    <td><TypeBadge type={t.type} /></td>
                                    <td><StatusBadge status={t.status} /></td>
                                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button className="action-btn-icon" onClick={() => handleDelete(t.id)} title="O'chirish">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="10" className="no-data">Tranzaksiyalar topilmadi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;