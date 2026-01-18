// src/pages/LotteryPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { lotteryService } from '../api/lotteryService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiGift, FiUserCheck, FiChevronRight, FiTrash2, FiPower } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LotteryPage = () => {
    // General Page State
    const [prizes, setPrizes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [overallStats, setOverallStats] = useState(null);

    // Prize Management State
    const [newPrize, setNewPrize] = useState({ amount: '', numberOfPrize: '' });

    // User Search & Actions State
    const [searchChatId, setSearchChatId] = useState('');
    const [userBalance, setUserBalance] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [ticketsToAdd, setTicketsToAdd] = useState(1);
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);

    // Random Award State
    const [randomAward, setRandomAward] = useState({ totalUsers: '', randomUsers: '', amount: '' });
    const [isAwarding, setIsAwarding] = useState(false);

    // Approved Users State
    const [approvedUsersChatIds, setApprovedUsersChatIds] = useState([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(true);

    // Bundle Management State
    const [bundles, setBundles] = useState([]);
    const [newBundle, setNewBundle] = useState({ tickets: '', price: '', currency: 'UZS', displayOrder: 0 });

    // Config State
    const [purchaseCooldown, setPurchaseCooldown] = useState(0);
    const [winningsPercentage, setWinningsPercentage] = useState(0);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // 1. Critical Data (Prizes, Approved Users, Overall Stats) - Fail if these fail
            const [prizesRes, usersRes, statsRes] = await Promise.all([
                lotteryService.getPrizes(),
                lotteryService.getApprovedUsersChatIds(),
                lotteryService.getOverallStats()
            ]);

            setPrizes(prizesRes.data);
            setApprovedUsersChatIds(usersRes.data);
            setOverallStats(statsRes.data);

            // 2. New Features Data (Bundles, Cooldown, Winnings) - Handle gracefully if 404/fail
            try {
                const bundlesRes = await lotteryService.getAllBundles();
                if (Array.isArray(bundlesRes.data)) {
                    setBundles(bundlesRes.data);
                } else {
                    setBundles([]);
                }
            } catch (ignored) {
                console.warn("Bundles endpoint not available yet");
                setBundles([]);
            }

            try {
                const cooldownRes = await lotteryService.getPurchaseCooldown();
                // Backend returns { cooldownSeconds: <number> }
                setPurchaseCooldown(cooldownRes.data.cooldownSeconds || 0);
            } catch (ignored) {
                console.warn("Cooldown endpoint not available yet");
            }

            try {
                const winningsRes = await lotteryService.getWinningsPercentage();
                // Backend returns { percentage: <number> }
                setWinningsPercentage(winningsRes.data.percentage || 0);
            } catch (ignored) {
                console.warn("Winnings endpoint not available yet");
            }

        } catch (err) {
            setError("Ma'lumotlarni yuklab bo'lmadi.");
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsFetchingUsers(false);
        }
    }, []);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchData();
    }, [fetchData]);

    // --- Bundle Handlers ---
    const handleBundleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBundle(prev => ({ ...prev, [name]: value }));
    };

    const handleAddBundle = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await lotteryService.createBundle(newBundle);
            setNewBundle({ tickets: '', price: '', currency: 'UZS', displayOrder: 0 });
            setSuccessMessage("Paket muvaffaqiyatli qo'shildi!");
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchData();
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError("Bundle tizimi hali backendda yoqilmagan (404).");
            } else {
                setError("Bundle qo'shishda xatolik yuz berdi.");
            }
        }
    };

    const handleDeleteBundle = async (id) => {
        if (window.confirm("Bundle ni o'chirasizmi?")) {
            try {
                await lotteryService.deleteBundle(id);
                fetchData();
            } catch (err) {
                console.error(err);
                setError("Bundle ni o'chirib bo'lmadi.");
            }
        }
    };

    const handleToggleBundle = async (id) => {
        try {
            await lotteryService.toggleBundle(id);
            fetchData();
        } catch (err) {
            console.error(err);
            setError("Bundle holatini o'zgartirib bo'lmadi.");
        }
    };

    // --- Config Handlers ---
    const handleUpdateCooldown = async () => {
        setError('');
        setSuccessMessage('');
        try {
            await lotteryService.setPurchaseCooldown(parseInt(purchaseCooldown));
            setSuccessMessage("Cooldown muvaffaqiyatli saqlandi!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError("Cooldown API topilmadi (404). Backendni tekshiring.");
            } else {
                setError("Cooldown yangilab bo'lmadi.");
            }
        }
    };

    const handleUpdateWinningsPercentage = async () => {
        setError('');
        setSuccessMessage('');
        try {
            await lotteryService.setWinningsPercentage(parseFloat(winningsPercentage));
            setSuccessMessage("Foiz muvaffaqiyatli saqlandi!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError("Winnings API topilmadi (404). Backendni tekshiring.");
            } else {
                setError("Foizni yangilab bo'lmadi.");
            }
        }
    };

    // --- Prize Management Handlers ---
    const handlePrizeInputChange = (e) => {
        const { name, value } = e.target;
        setNewPrize(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPrize = async (e) => {
        e.preventDefault();
        if (!newPrize.amount || !newPrize.numberOfPrize) {
            alert("Iltimos, sovrin miqdori va sonini to'ldiring.");
            return;
        }
        try {
            await lotteryService.addPrize(newPrize);
            setNewPrize({ amount: '', numberOfPrize: '' });
            await fetchData(); // Refresh data
        } catch (err) {
            setError("Sovrin qo'shib bo'lmadi.");
            console.error(err);
        }
    };

    const handleDeletePrize = async (id) => {
        if (window.confirm("Haqiqatan ham bu sovrinni o'chirmoqchimisiz?")) {
            try {
                await lotteryService.deletePrize(id);
                await fetchData(); // Refresh data
            } catch (err) {
                setError("Sovrinni o'chirib bo'lmadi.");
                console.error(err);
            }
        }
    };

    // --- User Search & Actions Handlers ---
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchChatId) {
            alert("Qidirish uchun Chat ID'ni kiriting.");
            return;
        }
        setIsSearching(true);
        setUserBalance(null);
        setError('');
        try {
            const response = await lotteryService.getUserBalance(searchChatId);
            setUserBalance(response.data);
        } catch (err) {
            setError("Foydalanuvchi topilmadi.");
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddTickets = async () => {
        if (!ticketsToAdd || ticketsToAdd < 1) {
            alert("Iltimos, yaroqli bilet sonini kiriting.");
            return;
        }
        setIsSubmittingAction(true);
        try {
            const response = await lotteryService.addTickets(userBalance.chatId, ticketsToAdd);
            setUserBalance(response.data);
            setTicketsToAdd(1);
        } catch (err) {
            setError("Bilet qo'shishda xatolik yuz berdi.");
            console.error(err);
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleResetTickets = async () => {
        if (window.confirm("Haqiqatan ham bu foydalanuvchining barcha biletlarini o'chirmoqchimisiz?")) {
            setIsSubmittingAction(true);
            try {
                await lotteryService.resetTickets(userBalance.chatId);
                const response = await lotteryService.getUserBalance(userBalance.chatId);
                setUserBalance(response.data);
            } catch (err) {
                setError("Biletlarni o'chirishda xatolik yuz berdi.");
                console.error(err);
            } finally {
                setIsSubmittingAction(false);
            }
        }
    };

    const handleResetBalance = async () => {
        if (window.confirm("DIQQAT! Haqiqatan ham bu foydalanuvchining balansini nolga tenglashtirmoqchimisiz?")) {
            setIsSubmittingAction(true);
            try {
                await lotteryService.resetBalance(userBalance.chatId);
                const response = await lotteryService.getUserBalance(userBalance.chatId);
                setUserBalance(response.data);
            } catch (err) {
                setError("Balansni o'chirishda xatolik yuz berdi.");
                console.error(err);
            } finally {
                setIsSubmittingAction(false);
            }
        }
    };

    // --- Random Money Award Handlers ---
    const handleRandomAwardChange = (e) => {
        const { name, value } = e.target;
        setRandomAward(prev => ({ ...prev, [name]: value }));
    };

    const handleRandomAwardSubmit = async (e) => {
        e.preventDefault();
        const { totalUsers, randomUsers, amount } = randomAward;
        if (!totalUsers || !randomUsers || !amount) {
            alert("Iltimos, barcha maydonlarni to'ldiring.");
            return;
        }
        if (parseInt(randomUsers) > parseInt(totalUsers)) {
            alert("Tasodifiy foydalanuvchilar soni umumiy foydalanuvchilar sonidan ko'p bo'lishi mumkin emas.");
            return;
        }

        setIsAwarding(true);
        setError('');
        setSuccessMessage('');

        try {
            await lotteryService.awardRandomUsers(randomAward);
            setSuccessMessage("Pul mukofoti tasodifiy foydalanuvchilarga muvaffaqiyatli tarqatildi!");
            setRandomAward({ totalUsers: '', randomUsers: '', amount: '' });
        } catch (err) {
            setError("Amalni bajarishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
            console.error(err);
        } finally {
            setIsAwarding(false);
        }
    };

    const totalNumberOfPrizes = prizes.reduce((total, prize) => total + (Number(prize.numberOfPrize) || 0), 0);

    if (isLoading && isFetchingUsers) return <Loader />;

    return (
        <div className="page-container lottery-page">
            <div className="page-header">
                <h1>Lotereya Tizimi</h1>
                {overallStats && (
                    <div className="header-stats">
                        <div className="stat-pill">
                            <span className="label">Jami Balans:</span>
                            <span className="value">{overallStats.totalBalance?.toLocaleString('uz-UZ')} UZS</span>
                        </div>
                        <div className="stat-pill">
                            <span className="label">Jami Biletlar:</span>
                            <span className="value">{overallStats.totalTickets?.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <div className="lottery-content-grid">

                {/* 1. Global Settings Config Panel (New) */}
                <div className="lottery-panel full-width-panel">
                    <h3>Lotereya Sozlamalari</h3>
                    <div className="settings-grid" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="setting-item">
                            <label>Sotib olish oralig'i (sekund)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    value={purchaseCooldown}
                                    onChange={(e) => setPurchaseCooldown(e.target.value)}
                                />
                                <Button onClick={handleUpdateCooldown} primary>Saqlash</Button>
                            </div>
                        </div>
                        <div className="setting-item">
                            <label>Yutuq foizi (Daily Limitga qo'shiladi)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={
                                        typeof winningsPercentage === 'number'
                                            ? Number(winningsPercentage).toFixed(8).replace(/\.?0+$/, "")
                                            : winningsPercentage
                                    }
                                    onChange={(e) => setWinningsPercentage(e.target.value)}
                                />
                                <Button onClick={handleUpdateWinningsPercentage} primary>Saqlash</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Bundle Management Panel (New) */}
                <div className="lottery-panel">
                    <h3>Bilet Paketlari (Bundles)</h3>
                    <form onSubmit={handleAddBundle} className="form">
                        <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                            <div className="form__group" style={{ flex: 1 }}>
                                <label>Biletlar Soni</label>
                                <input type="number" name="tickets" value={newBundle.tickets} onChange={handleBundleInputChange} required />
                            </div>
                            <div className="form__group" style={{ flex: 1 }}>
                                <label>Narxi (UZS)</label>
                                <input type="number" name="price" value={newBundle.price} onChange={handleBundleInputChange} required />
                            </div>
                        </div>
                        <Button type="submit" primary>Paket Qo'shish</Button>
                    </form>

                    <div className="bundles-list" style={{ marginTop: '20px' }}>
                        {bundles.map(bundle => (
                            <div key={bundle.id} className="bundle-item" style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '10px',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <strong>{bundle.tickets} ta bilet</strong> - {Number(bundle.price).toLocaleString()} {bundle.currency}
                                    <div style={{ fontSize: '0.8em', color: bundle.isActive ? '#53bf9d' : '#e94560' }}>
                                        {bundle.isActive ? 'Faol' : 'Nofaol'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <Button
                                        onClick={() => handleToggleBundle(bundle.id)}
                                        primary={!bundle.isActive}
                                        className={bundle.isActive ? "btn-deactivate" : ""}
                                        small
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <FiPower />
                                        {bundle.isActive ? 'Nofaol qilish' : 'Yoqish'}
                                    </Button>
                                    <Button onClick={() => handleDeleteBundle(bundle.id)} danger small>
                                        <FiTrash2 />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Prize Management Panel (Top Left) */}
                <div className="lottery-panel">
                    <h3>Sovrinlarni Boshqarish</h3>
                    <form onSubmit={handleAddPrize} className="form">
                        <div className="form__group">
                            <label htmlFor="amount">Sovrin Miqdori</label>
                            <input type="number" name="amount" value={newPrize.amount} onChange={handlePrizeInputChange} placeholder="Masalan, 100000" required />
                        </div>
                        <div className="form__group">
                            <label htmlFor="numberOfPrize">Sovrinlar Soni (Miqdori)</label>
                            <input type="number" name="numberOfPrize" value={newPrize.numberOfPrize} onChange={handlePrizeInputChange} placeholder="Masalan, 5" required />
                        </div>
                        <Button type="submit" primary>Sovrin Qo'shish</Button>
                    </form>

                    <h4>Mavjud Sovrinlar</h4>
                    <div className="lottery-summary-card">
                        <FiGift className="summary-icon" />
                        <div className="summary-text">
                            <span className="summary-number">{totalNumberOfPrizes}</span>
                            <span className="summary-label">Umumiy Qolgan Sovrinlar</span>
                        </div>
                    </div>

                    <ul className="prize-list">
                        {prizes.length > 0 ? prizes.map(prize => (
                            <li key={prize.id}>
                                <div className="prize-info">
                                    <span>{Number(prize.amount).toLocaleString('uz-UZ')} So'm</span>
                                    <small>Soni: {prize.numberOfPrize}</small>
                                </div>
                                <Button danger onClick={() => handleDeletePrize(prize.id)}>O'chirish</Button>
                            </li>
                        )) : (
                            <li>Hozircha sozlanmagan sovrinlar yo'q.</li>
                        )}
                    </ul>
                </div>

                {/* 4. User Search & Actions Panel (Top Right) */}
                <div className="lottery-panel">
                    <h3>Foydalanuvchi Balansini Tekshirish</h3>
                    <form onSubmit={handleSearchSubmit} className="form">
                        <div className="form__group">
                            <label htmlFor="chatId">Foydalanuvchi Chat ID'si</label>
                            <input type="number" name="chatId" value={searchChatId} onChange={(e) => setSearchChatId(e.target.value)} placeholder="Foydalanuvchining Chat ID'sini kiriting" required />
                        </div>
                        <div className="form__actions">
                            <Button type="submit" primary disabled={isSearching}>{isSearching ? 'Qidirilmoqda...' : 'Qidirish'}</Button>
                        </div>
                    </form>

                    {isSearching && <Loader />}
                    {userBalance && (
                        <>
                            <div className="simulation-results">
                                <h4>{userBalance.chatId} raqamli foydalanuvchi</h4>
                                <p>Joriy balans: <span>{Number(userBalance.balance).toLocaleString('uz-UZ')} So'm</span></p>
                                <p>Mavjud biletlar: <span>{userBalance.tickets}</span></p>
                            </div>
                            <div className="user-actions-panel">
                                <h5>Foydalanuvchi Amallari</h5>
                                <div className="add-tickets-form">
                                    <input type="number" value={ticketsToAdd} onChange={(e) => setTicketsToAdd(e.target.value)} min="1" disabled={isSubmittingAction} />
                                    <Button onClick={handleAddTickets} primary disabled={isSubmittingAction}>Bilet Qo'shish</Button>
                                </div>
                                <div className="reset-actions">
                                    <Button onClick={handleResetTickets} danger disabled={isSubmittingAction}>Biletlarni O'chirish</Button>
                                    <Button onClick={handleResetBalance} danger disabled={isSubmittingAction}>Balansni O'chirish</Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 5. Random Money Award Panel (Full Width - Pastki) */}
                <div className="lottery-panel full-width-panel">
                    <h3>Tasodifiy Foydalanuvchilarga Pul Berish</h3>

                    <div className="random-award-layout-grid">

                        {/* APPROVED USERS INFO BLOCK */}
                        <div className="random-award-info-block">
                            <p className="panel-description">
                                Bu yerda siz oxirgi **{randomAward.totalUsers || 'N'}** ta tasdiqlangan so'rov egalari orasidan **{randomAward.randomUsers || 'X'}** tasiga **{randomAward.amount || 'Y'}** UZS miqdorida mukofot berishingiz mumkin.
                            </p>

                            <div className="lottery-summary-card approved-users-card">
                                <FiUserCheck className="summary-icon" />
                                <div className="summary-text">
                                    <span className="summary-number">{approvedUsersChatIds.length.toLocaleString()}</span>
                                    <span className="summary-label">Tasdiqlangan Unikal Chat ID'lar</span>
                                </div>
                            </div>


                        </div>

                        {/* RANDOM AWARD FORM BLOCK */}
                        <form onSubmit={handleRandomAwardSubmit} className="random-award-form">
                            <div className="form__group">
                                <label htmlFor="totalUsers">So'rovlar Soni (oxirgi)</label>
                                <input type="number" name="totalUsers" value={randomAward.totalUsers} onChange={handleRandomAwardChange} placeholder="Masalan, 1000" required />
                            </div>
                            <div className="form__group">
                                <label htmlFor="randomUsers">Tasodifiy Foydalanuvchilar Soni</label>
                                <input type="number" name="randomUsers" value={randomAward.randomUsers} onChange={handleRandomAwardChange} placeholder="Masalan, 10" required />
                            </div>
                            <div className="form__group">
                                <label htmlFor="amount">Pul Miqdori (har biriga)</label>
                                <input type="number" name="amount" value={randomAward.amount} onChange={handleRandomAwardChange} placeholder="Masalan, 50000" required />
                            </div>
                            <div className="form__group submit-group">
                                <Button type="submit" primary disabled={isAwarding}>
                                    {isAwarding ? 'Yuborilmoqda...' : 'Pulni Tarqatish'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>


            </div>
        </div>
    );
};

// Add styles for the header stats here or in your CSS file
const styles = `
    .header-stats {
        display: flex;
        gap: 15px;
        margin-top: 10px;
    }
    .stat-pill {
        background: rgba(255, 255, 255, 0.1);
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .stat-pill .label {
        color: #aaa;
    }
    .stat-pill .value {
        color: #fff;
        font-weight: bold;
    }
    .toggle-btn {
        background: rgba(83, 191, 157, 0.2);
        color: #53bf9d;
        border: 1px solid rgba(83, 191, 157, 0.4);
    }
    .toggle-btn:hover {
        background: rgba(83, 191, 157, 0.3);
    }
    .toggle-btn.inactive {
        background: rgba(233, 69, 96, 0.2);
        color: #e94560;
        border: 1px solid rgba(233, 69, 96, 0.4);
    }
    .toggle-btn.inactive:hover {
        background: rgba(233, 69, 96, 0.3);
    }
    .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    .btn-deactivate {
        background: rgba(255, 193, 7, 0.15);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }
    .btn-deactivate:hover {
        background: rgba(255, 193, 7, 0.25);
        color: #ffca2c;
    }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default LotteryPage;