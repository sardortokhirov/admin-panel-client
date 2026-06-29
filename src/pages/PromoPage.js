import React, { useState, useEffect, useCallback } from 'react';
import { promoService } from '../api/promoService';
import { dashboardService } from '../api/dashboardService';
import { setAuthHeader } from '../api/apiService';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import PromoChatDetailModal from '../components/promo/PromoChatDetailModal';
import {
    FiCheckCircle,
    FiShield,
    FiUsers,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiSearch,
    FiCircle,
} from 'react-icons/fi';

const PromoPage = () => {
    const [chatIdInput, setChatIdInput] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [chats, setChats] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [promoEnabled, setPromoEnabled] = useState(null);
    const [detailChatId, setDetailChatId] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState(null);

    const fetchChats = useCallback(async (pageNumber = 0) => {
        setFetching(true);
        try {
            const response = await promoService.getChats(pageNumber, size);
            const data = response.data;
            setChats(data.content || []);
            setTotalPages(data.totalPages || 0);
            setPage(pageNumber);
        } catch (err) {
            console.error('Failed to fetch chats', err);
            setError('Chat ro\'yxatini yuklab bo\'lmadi.');
        } finally {
            setFetching(false);
        }
    }, [size]);

    const fetchPromoStatus = async () => {
        try {
            const toggles = await dashboardService.GetToggles();
            setPromoEnabled(!!toggles.promoEnabled);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const storedAuth = localStorage.getItem('authData');
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchChats(0);
        fetchPromoStatus();
    }, [fetchChats]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchChats(newPage);
        }
    };

    const handleAddChat = async (e) => {
        e.preventDefault();
        if (!chatIdInput.trim()) {
            setError('Iltimos, Telegram Chat ID sini kiriting');
            return;
        }
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            await promoService.addChat(chatIdInput.trim());
            setMessage(`Chat ID [${chatIdInput.trim()}] muvaffaqiyatli qo'shildi.`);
            setChatIdInput('');
            fetchChats(page);
        } catch (err) {
            console.error(err);
            setError('Chat ID qo\'shishda xatolik yuz berdi.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveChat = async (idToRemove) => {
        if (!window.confirm(`Haqiqatan ham Chat ID ${idToRemove} ni o'chirmoqchimisiz?`)) return;
        try {
            await promoService.deleteChat(idToRemove);
            fetchChats(page);
        } catch (err) {
            console.error(err);
            alert('O\'chirishda xatolik yuz berdi');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const q = searchInput.trim();
        if (!q) return;
        setSearchError(null);
        setSearchResult(null);
        if (!/^\d+$/.test(q)) {
            setSearchError('Faqat raqamli Chat ID yoki Platforma ID kiriting.');
            return;
        }
        try {
            try {
                const chatRes = await promoService.searchPromo({ chatId: q });
                setSearchResult(chatRes.data);
            } catch {
                const platformRes = await promoService.searchPromo({ platformUserId: q });
                setSearchResult(platformRes.data);
            }
        } catch (err) {
            setSearchError('Natija topilmadi.');
        }
    };

    return (
        <div className="page-container promo-page">
            <div className="page-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <h1>Promo Whitelist</h1>
                </div>
                <p className="subtitle">
                    Promo rejimi yoqilgan paytda foydalanuvchilarga pul yechishga ruxsat berish.
                    {promoEnabled !== null && (
                        <span className={`promo-status ${promoEnabled ? 'on' : 'off'}`}>
                            Promo rejimi: {promoEnabled ? 'YONIQ' : 'O\'CHIQ'}
                        </span>
                    )}
                </p>
            </div>

            <div className="promo-search-card">
                <form onSubmit={handleSearch} className="search-form">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Chat ID yoki Platforma foydalanuvchi ID qidirish"
                        className="custom-input flex-grow"
                    />
                    <Button primary type="submit">Qidirish</Button>
                </form>
                {searchError && <div className="error-message">{searchError}</div>}
                {searchResult && (
                    <div className="search-results">
                        {searchResult.searchType === 'chat' ? (
                            <>
                                <h4>Chat ID: {searchResult.chatId}</h4>
                                {searchResult.links?.length ? (
                                    <ul>
                                        {searchResult.links.map((l) => (
                                            <li key={l.id}>
                                                {l.platformName} — <span className="mono">{l.platformUserId}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="muted">Platforma bog'lanmagan.</p>
                                )}
                                <Button onClick={() => setDetailChatId(searchResult.chatId)}>Batafsil</Button>
                            </>
                        ) : (
                            <>
                                <h4>Platforma ID: <span className="mono">{searchResult.platformUserId}</span></h4>
                                {searchResult.links?.length > 0 ? (
                                    <ul>
                                        {searchResult.links.map((l) => (
                                            <li key={l.id}>
                                                {l.platformName} — Chat:{' '}
                                                <button
                                                    type="button"
                                                    className="link-btn"
                                                    onClick={() => setDetailChatId(l.chatId)}
                                                >
                                                    {l.chatId}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : searchResult.linkedChatIds?.length > 0 ? (
                                    <ul>
                                        {searchResult.linkedChatIds.map((cid) => (
                                            <li key={cid}>
                                                <button
                                                    type="button"
                                                    className="link-btn"
                                                    onClick={() => setDetailChatId(cid)}
                                                >
                                                    {cid}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="promo-card">
                <div className="card-header">
                    <FiUsers className="card-icon" />
                    <h3>Telegram Chat qo'shish</h3>
                </div>
                <form onSubmit={handleAddChat} className="promo-form">
                    <div className="form-group row">
                        <input
                            type="text"
                            value={chatIdInput}
                            onChange={(e) => setChatIdInput(e.target.value)}
                            placeholder="Telegram Chat ID"
                            className="custom-input flex-grow"
                        />
                        <Button primary type="submit" disabled={loading}>
                            {loading ? '...' : 'Qo\'shish'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="users-list-card">
                <div className="list-header">
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
                                        <th>Holat</th>
                                        <th>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chats.length > 0 ? (
                                        chats.map((chat) => (
                                            <tr key={chat.chatId}>
                                                <td className="user-id-cell">{chat.chatId}</td>
                                                <td>
                                                    {chat.filled ? (
                                                        <span className="status-filled" title="Platforma bog'langan">
                                                            <FiCheckCircle /> To'ldirilgan
                                                        </span>
                                                    ) : (
                                                        <span className="status-empty" title="Platforma yo'q">
                                                            <FiCircle /> Bo'sh
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailChatId(chat.chatId)}
                                                        className={`view-btn ${chat.filled ? 'view-btn-filled' : ''}`}
                                                        title="Ko'rish va platforma qo'shish"
                                                    >
                                                        <FiEye />
                                                        <span className="action-label">Ko'rish</span>
                                                    </button>
                                                    <button
                                                        type="button"
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
                                            <td colSpan="3" className="empty-text">Ro'yxat bo'sh</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                    className="pagination-btn"
                                >
                                    <FiChevronLeft />
                                </button>
                                <span className="page-info">{page + 1} / {totalPages}</span>
                                <button
                                    type="button"
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

            {message && (
                <div className="success-message">
                    <FiCheckCircle /> {message}
                </div>
            )}
            {error && <div className="error-message">{error}</div>}

            <div className="info-card">
                <h3>Eslatma</h3>
                <p>
                    Avval <strong>Chat ID</strong> qo'shing, keyin <strong>Ko'rish</strong> tugmasi orqali bir yoki bir nechta kontora va platforma ID bog'lang.
                    Promo yoqilganda bonus faqat shu bog'langan juftliklar uchun ruxsat etiladi.
                </p>
            </div>

            {detailChatId && (
                <PromoChatDetailModal
                    chatId={detailChatId}
                    onClose={() => setDetailChatId(null)}
                    onLinksChanged={() => fetchChats(page)}
                />
            )}

            <style jsx="true">{`
                .promo-page { color: #fff; max-width: 900px; margin: 0 auto; }
                .page-header { margin-bottom: 1.5rem; }
                .header-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
                .header-icon { font-size: 2rem; color: #e94560; }
                .header-title h1 { font-size: 1.8rem; margin: 0; }
                .subtitle { color: #a0a0a0; margin: 0; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
                .promo-status { font-size: 0.85rem; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; }
                .promo-status.on { background: rgba(83,191,157,0.2); color: #53bf9d; }
                .promo-status.off { background: rgba(233,69,96,0.2); color: #e94560; }
                .promo-search-card, .promo-card, .users-list-card, .info-card {
                    background: #16213e; border-radius: 12px; padding: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem;
                }
                .search-form { display: flex; gap: 0.75rem; align-items: center; }
                .search-icon { color: #a0a0a0; flex-shrink: 0; }
                .search-results { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); }
                .search-results ul { margin: 0.5rem 0; padding-left: 1.25rem; }
                .link-btn { background: none; border: none; color: #53bf9d; cursor: pointer; text-decoration: underline; }
                .mono { font-family: monospace; color: #e94560; }
                .muted { color: #a0a0a0; font-style: italic; }
                .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
                .card-icon { font-size: 1.5rem; color: #53bf9d; }
                .form-group.row { display: flex; gap: 1rem; align-items: center; }
                .flex-grow { flex: 1; }
                .custom-input {
                    width: 100%; padding: 0.8rem 1rem; background: #0f3460;
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;
                }
                .transaction-table { width: 100%; border-collapse: collapse; }
                .transaction-table th, .transaction-table td {
                    padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .transaction-table th { color: #a0a0a0; font-size: 0.85rem; text-transform: uppercase; }
                .user-id-cell { font-family: monospace; color: #e94560; }
                .status-filled { color: #53bf9d; display: flex; align-items: center; gap: 0.35rem; }
                .status-empty { color: #a0a0a0; display: flex; align-items: center; gap: 0.35rem; }
                .actions-cell { display: flex; gap: 0.5rem; }
                .view-btn, .delete-btn {
                    border: none; cursor: pointer; padding: 0.45rem 0.65rem; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; gap: 0.35rem;
                    font-size: 0.85rem;
                }
                .view-btn { background: rgba(83,191,157,0.15); color: #53bf9d; min-width: 32px; height: 34px; }
                .view-btn-filled { background: rgba(83,191,157,0.35); color: #53bf9d; box-shadow: inset 0 0 0 1px rgba(83,191,157,0.5); }
                .delete-btn { width: 34px; height: 34px; padding: 0.5rem; background: rgba(233,69,96,0.1); color: #e94560; }
                .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1rem; }
                .pagination-btn {
                    background: #0f3460; border: 1px solid rgba(255,255,255,0.1); color: #fff;
                    padding: 0.5rem; border-radius: 6px; cursor: pointer;
                }
                .success-message { color: #53bf9d; margin: 1rem 0; display: flex; gap: 0.5rem; align-items: center; }
                .error-message { color: #e94560; margin: 1rem 0; }
                .empty-text { text-align: center; color: #a0a0a0; padding: 2rem; }
            `}</style>
        </div>
    );
};

export default PromoPage;
