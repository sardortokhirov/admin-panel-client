
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersService } from '../api/usersService';
import { systemConfigService } from '../api/systemConfigService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import {
    FaArrowLeft, FaEdit, FaTrash, FaBan, FaCheck, FaCoins, FaTicketAlt, FaChartLine, FaGlobe, FaPhone, FaCalendarAlt, FaGamepad, FaShieldAlt
} from 'react-icons/fa';
import { FiRefreshCw, FiAlertTriangle, FiActivity, FiArrowUpRight, FiArrowDownLeft, FiInfo, FiCreditCard } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { STATUS_MAP } from '../constants/statusConstants';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const UserProfilePage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();

    // Data States
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [transfers, setTransfers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transfersLoading, setTransfersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dailyStats, setDailyStats] = useState(null);
    const [dailyStatsLoading, setDailyStatsLoading] = useState(false);

    // Transfer Filters
    const [transferPage, setTransferPage] = useState(0);
    const [transferSize, setTransferSize] = useState(10);
    const [transferFilters, setTransferFilters] = useState({
        status: '',
        platform: '',
        type: '',
        startDate: '',
        endDate: ''
    });

    // Daily Stats Filters
    const [dailyStatsPage, setDailyStatsPage] = useState(0);
    const [dailyStatsSize, setDailyStatsSize] = useState(10);
    const [dailyStatsFilters, setDailyStatsFilters] = useState({
        startDate: '',
        endDate: ''
    });

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [modalValue, setModalValue] = useState('');
    const [baseLimitPercent, setBaseLimitPercent] = useState('');
    const [systemDefaultBaseDailyLimit, setSystemDefaultBaseDailyLimit] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [userRes, summaryRes] = await Promise.all([
                usersService.getUserDetails(chatId),
                usersService.getUserSummary(chatId)
            ]);
            setUser(userRes.data);
            setSummary(summaryRes.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError("Foydalanuvchi topilmadi");
            } else {
                setError("Foydalanuvchi ma'lumotlarini yuklashda xatolik.");
            }
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    const fetchTransfers = useCallback(async () => {
        setTransfersLoading(true);
        try {
            const params = {
                page: transferPage,
                size: transferSize,
                ...transferFilters
            };
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });

            const response = await usersService.getUserTransfers(chatId, params);
            setTransfers(response.data);
        } catch (err) {
            console.error("Transfers fetch error:", err);
        } finally {
            setTransfersLoading(false);
        }
    }, [chatId, transferPage, transferSize, transferFilters]);

    const fetchDailyStats = useCallback(async () => {
        setDailyStatsLoading(true);
        try {
            const params = {
                page: dailyStatsPage,
                size: dailyStatsSize,
                ...dailyStatsFilters
            };
            // Clean params
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });

            const response = await usersService.getDailyStats(chatId, params);
            setDailyStats(response.data);
        } catch (err) {
            console.error("Daily stats fetch error:", err);
        } finally {
            setDailyStatsLoading(false);
        }
    }, [chatId, dailyStatsPage, dailyStatsSize, dailyStatsFilters]);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchData();
        // Fetch system config default dailyBonusTransferLimit
        systemConfigService.getConfiguration().then(res => {
            if (res.data && res.data.dailyBonusTransferLimit !== undefined) {
                setSystemDefaultBaseDailyLimit(res.data.dailyBonusTransferLimit);
            }
        }).catch(err => console.error('Failed to fetch system config:', err));
    }, [fetchData]);

    // Separate useEffect for Transfers
    useEffect(() => {
        fetchTransfers();
    }, [fetchTransfers]);

    // Separate useEffect for Daily Stats
    useEffect(() => {
        fetchDailyStats();
    }, [fetchDailyStats]);

    // Actions
    const handleAction = async (actionFn, successMsg) => {
        if (!window.confirm("Ishonchingiz komilmi?")) return;
        try {
            await actionFn();
            alert(successMsg);
            fetchData();
        } catch (err) {
            alert("Xatolik: " + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (deleteType = 'hard') => {
        const msg = deleteType === 'hard'
            ? "Foydalanuvchini BUTUNLAY (barcha tarix, so'rovlar va limitlar bilan birga) o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!"
            : "Foydalanuvchini yumshoq o'chirmoqchimisiz? (Foydalanuvchi bloklanadi va BARCHA balanslari, jumladan hamyoni ham nolga tushiriladi)";

        if (!window.confirm(msg)) return;
        try {
            await usersService.deleteUser(chatId, deleteType);
            alert("Foydalanuvchi o'chirildi.");
            navigate('/users');
        } catch (err) {
            alert("O'chirishda xatolik: " + err.message);
        }
    };

    // Modal Handlers
    const openModal = (type) => {
        setModalType(type);
        if (type === 'balance') setModalValue(user.balance);
        if (type === 'tickets') setModalValue(user.tickets);
        if (type === 'limit') setModalValue(user.permanentLimitIncrease);
        if (type === 'baseDailyLimit') {
            // Calculate current percentage relative to system default
            const currentVal = user.baseDailyLimit ?? 0;
            if (systemDefaultBaseDailyLimit > 0) {
                setBaseLimitPercent(String(Math.round((currentVal / systemDefaultBaseDailyLimit) * 100)));
            } else {
                setBaseLimitPercent('100');
            }
        }
        if (type === 'language') setModalValue(user.language);
        if (type === 'withdrawQuota') setModalValue('');
        setModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'balance') await usersService.updateBalance(chatId, modalValue);
            if (modalType === 'tickets') await usersService.updateTickets(chatId, modalValue);
            if (modalType === 'limit') {
                const res = await usersService.updateLimit(chatId, modalValue);
                if (res.data) {
                    setUser(prev => ({
                        ...prev,
                        permanentLimitIncrease: res.data.permanentLimitIncrease,
                        effectiveDailyLimit: res.data.effectiveDailyLimit,
                        permanentLimitLastUpdated: res.data.lastUpdated
                    }));
                }
            }
            if (modalType === 'baseDailyLimit') {
                const percentage = Number(baseLimitPercent);
                const res = await usersService.updateBaseDailyLimit(chatId, percentage);
                if (res.data) {
                    setUser(prev => ({
                        ...prev,
                        baseDailyLimit: res.data.baseDailyLimit,
                        effectiveDailyLimit: res.data.effectiveDailyLimit
                    }));
                }
            }
            if (modalType === 'language') await usersService.updateLanguage(chatId, modalValue);
            if (modalType === 'withdrawQuota') {
                const amount = Number(modalValue);
                if (isNaN(amount) || amount < 0) {
                    alert("Miqdor 0 dan katta bo'lishi kerak");
                    return;
                }
                await usersService.addWithdrawQuota(chatId, amount);
            }

            alert("Muvaffaqiyatli saqlandi!");
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert("Saqlashda xatolik: " + (err.response?.data || err.message));
        }
    };

    const formatCurrency = (val) => Number(val || 0).toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 });
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('uz-UZ') : '-';

    // Chart Data Preparation
    const getRequestStatsData = () => {
        if (!summary) return null;
        return {
            labels: [
                STATUS_MAP.APPROVED.label,
                STATUS_MAP.CANCELED.label,
                STATUS_MAP.PENDING.label,
                STATUS_MAP.FAILED.label
            ],
            datasets: [
                {
                    data: [summary.approvedRequests, summary.canceledRequests, summary.pendingRequests, summary.failedRequests],
                    backgroundColor: [
                        STATUS_MAP.APPROVED.color,
                        STATUS_MAP.CANCELED.color,
                        STATUS_MAP.PENDING.color,
                        STATUS_MAP.FAILED.color
                    ],
                    borderColor: '#1a1a2e',
                    borderWidth: 2,
                },
            ],
        };
    };

    const getVolumeStatsData = () => {
        if (!summary) return null;
        return {
            labels: ['Top-uplar', 'Transferlar'],
            datasets: [
                {
                    label: 'Summa (UZS)',
                    data: [summary.totalTopUps, summary.totalTransfers],
                    backgroundColor: ['rgba(83, 191, 157, 0.5)', 'rgba(54, 162, 235, 0.5)'],
                    borderColor: ['#53bf9d', '#36a2eb'],
                    borderWidth: 1,
                },
            ],
        };
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="page-container" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiAlertTriangle size={60} color="#e94560" style={{ marginBottom: '20px' }} />
                <h2 style={{ color: '#fff', marginBottom: '10px' }}>{error}</h2>
                <Button primary onClick={() => navigate('/users-list')}>Orqaga</Button>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="page-container user-profile-page">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Button secondary onClick={() => navigate('/users-list')}><FaArrowLeft /> Ro'yxatga</Button>
                    <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Foydalanuvchi Profili</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: user.isBlocked ? 'rgba(233, 69, 96, 0.2)' : 'rgba(83, 191, 157, 0.2)',
                        color: user.isBlocked ? '#e94560' : '#53bf9d',
                        fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        {user.isBlocked ? <FaBan /> : <FaCheck />}
                        {user.isBlocked ? 'BLOKLANGAN' : 'FAOL'}
                    </div>
                </div>
            </div>

            {/* SECTION 1: User All Data (Identity + Assets) */}
            <div className="responsive-grid-sidebar-right">
                {/* Identity Card */}
                <div className="card profile-card" style={{ background: '#252a41', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <div className="profile-header" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px' }}>
                        <div className="avatar-placeholder" style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', color: '#fff' }}>
                            {user.chatId.toString().slice(0, 2)}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: '#fff' }}>Chat ID: {user.chatId}</h2>
                            <p style={{ margin: 0, color: '#a0a0a0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaPhone size={14} /> {user.phoneNumber || 'Raqam yo\'q'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <span style={{ display: 'block', color: '#888', fontSize: '0.9rem' }}>Til</span>
                            <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{user.language}</strong> <FaEdit style={{ cursor: 'pointer', color: '#667eea' }} onClick={() => openModal('language')} />
                        </div>
                    </div>
                    <div className="profile-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="detail-item">
                            <label style={{ color: '#888', display: 'block', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaCalendarAlt /> Ro'yxatdan o'tgan</label>
                            <div style={{ color: '#fff', fontWeight: '500' }}>{formatDate(user.registeredAt)}</div>
                        </div>
                        <div className="detail-item">
                            <label style={{ color: '#888', display: 'block', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><FaGamepad /> Platformalar</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {user.platformsUsed && user.platformsUsed.length > 0 ?
                                    user.platformsUsed.map(p => <span key={p} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{p}</span>)
                                    : <span style={{ color: '#666' }}>Hech qanday</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assets Card */}
                <div className="card assets-card">
                    <div className="balance-item">
                        <span className="label">Hozirgi Balans (Referral)</span>
                        <div className="value referral">
                            <FaCoins /> {formatCurrency(user.balance)}
                            <Button secondary small onClick={() => openModal('balance')} style={{ marginLeft: '10px' }}><FaEdit /></Button>
                        </div>
                    </div>

                    <div className="balance-item" style={{ marginBottom: 0 }}>
                        <span className="label">Hamyon Balansi</span>
                        <div className="value wallet">
                            <FiCreditCard /> {formatCurrency(user.walletBalance || 0)}
                        </div>

                        {/* Withdrawal Quota Info */}
                        <div className="quota-section">
                            <div className="quota-header">
                                <div className="title-group">
                                    <FiActivity /> Yechish Kvotasi
                                </div>
                                <Button secondary small onClick={() => openModal('withdrawQuota')}>+ Quota</Button>
                            </div>

                            <div className="quota-grid">
                                <div className="quota-item">
                                    <span className="q-label">Ishlangan</span>
                                    <span className="q-value">{formatCurrency(user.walletQuotaEarned || 0)}</span>
                                    <p className="q-info">Platformadan yig'ilgan</p>
                                </div>
                                <div className="quota-item">
                                    <span className="q-label">Bonus</span>
                                    <span className="q-value bonus">{formatCurrency(user.walletQuotaBonus || 0)}</span>
                                    <p className="q-info">Admin qo'shgan</p>
                                </div>
                                <div className="quota-item">
                                    <span className="q-label">Ishlatilgan</span>
                                    <span className="q-value used">{formatCurrency(user.walletQuotaUsed || 0)}</span>
                                    <p className="q-info">Yechib olingan</p>
                                </div>
                                <div className="quota-item highlight">
                                    <span className="q-label">Qolgan</span>
                                    <span className="q-value remaining">{formatCurrency(user.walletQuotaRemaining || 0)}</span>
                                    <p className="q-info">Mavjud summa</p>
                                </div>
                            </div>

                            <div className="quota-progress">
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min((user.walletQuotaRemaining / ((user.walletQuotaEarned || 1) + (user.walletQuotaBonus || 0))) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="progress-text">
                                    <span>Mavjud foiz</span>
                                    <span>{Math.round(Math.min((user.walletQuotaRemaining / ((user.walletQuotaEarned || 1) + (user.walletQuotaBonus || 0))) * 100, 100))}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaTicketAlt size={24} color="#f9d56e" />
                            <div>
                                <div style={{ color: '#888', fontSize: '0.9rem' }}>Biletlar</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.tickets}</div>
                            </div>
                        </div>
                        <Button secondary small onClick={() => openModal('tickets')}>O'zgartirish</Button>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Limits & Management */}
            <div className="responsive-grid-halves">
                {/* Limits */}
                <div className="card" style={{ background: '#252a41', borderRadius: '15px', padding: '25px' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaChartLine color="#36a2eb" /> Limitlar nazorati
                        </div>
                        {user.limitBreakdown && (
                            <div className="tooltip-container" title={user.limitBreakdown} style={{ cursor: 'help' }}>
                                <FiInfo size={18} color="#aaa" />
                            </div>
                        )}
                    </h3>

                    <div className="limit-row" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#aaa' }}>Mavjud Limit</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{formatCurrency(user.availableLimit)}</span>
                        </div>
                        <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.min((user.availableLimit / user.effectiveDailyLimit) * 100, 100)}%`,
                                height: '100%',
                                background: '#53bf9d'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                            <span>0 UZS</span>
                            <span>Max: {formatCurrency(user.effectiveDailyLimit)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Bazaviy <FaEdit style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#53bf9d' }} onClick={() => openModal('baseDailyLimit')} />
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{formatCurrency(user.baseDailyLimit ?? 0)}</div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Doimiy <FaEdit style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#667eea' }} onClick={() => openModal('limit')} />
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                {formatCurrency(user.permanentLimitIncrease)}
                            </div>
                            {user.permanentLimitIncreaseFormatted && (
                                <div style={{ fontSize: '0.65rem', color: '#667eea', marginTop: '2px', fontFamily: 'monospace' }}>
                                    {user.permanentLimitIncreaseFormatted}
                                </div>
                            )}
                            {user.permanentLimitLastUpdated && (
                                <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '4px' }}>
                                    {formatDate(user.permanentLimitLastUpdated)}
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>Lotereyadan</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f9d56e' }}>+{formatCurrency(user.dailyLimitIncrease)}</div>
                            {user.dailyStatsLastUpdated && (
                                <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '4px' }}>
                                    {formatDate(user.dailyStatsLastUpdated)}
                                </div>
                            )}
                        </div>
                    </div>

                    {user.limitBreakdown && (
                        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#aaa', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                            {user.limitBreakdown}
                        </div>
                    )}
                </div>

                {/* Management Actions */}
                <div className="card" style={{ background: '#252a41', borderRadius: '15px', padding: '25px' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaShieldAlt color="#e94560" /> Boshqaruv Paneli
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {user.isBlocked ? (
                            <Button success onClick={() => handleAction(() => usersService.unblockUser(chatId), "Foydalanuvchi blokdan chiqarildi")} style={{ height: '60px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <FaCheck /> Blokdan Chiqarish
                            </Button>
                        ) : (
                            <Button danger onClick={() => handleAction(() => usersService.blockUser(chatId), "Foydalanuvchi bloklandi")} style={{ height: '60px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <FaBan /> Bloklash
                            </Button>
                        )}
                        <Button secondary onClick={() => handleAction(() => usersService.resetDailyStats(chatId), "Kunlik statistika reset qilindi")} style={{ height: '60px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <FiRefreshCw /> Kunlik Reset
                        </Button>
                        <Button warning outline onClick={() => handleAction(() => usersService.resetBalance(chatId), "Barcha balanslar (Referral, Hamyon, Biletlar) reset qilindi")} style={{ height: '60px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <FaCoins /> Balans Reset
                        </Button>
                        <Button danger outline onClick={() => handleDelete('hard')} style={{ height: '60px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <FaTrash /> O'chirish
                        </Button>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Activity Statistics */}
            {
                summary && (
                    <div className="section-container" style={{ marginBottom: '25px', overflow: 'hidden' }}>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiActivity /> Faoliyat Statistikasi
                        </h2>
                        <div className="responsive-grid-thirds-stats">
                            {/* Stats Summary Cards (Left) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="stat-card" style={{ background: '#252a41', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #53bf9d' }}>
                                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Jami Top-uplar</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(summary.totalTopUps)}</div>
                                    <div style={{ color: '#53bf9d', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}><FiArrowDownLeft /> Kirim</div>
                                </div>
                                <div className="stat-card" style={{ background: '#252a41', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #36a2eb' }}>
                                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Hamyon Balansi</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(summary.walletBalance || 0)}</div>
                                    <div style={{ color: '#36a2eb', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}><FiActivity /> Joriy</div>
                                </div>
                                <div className="stat-card" style={{ background: '#252a41', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #36a2eb' }}>
                                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Jami Transferlar</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(summary.totalTransfers)}</div>
                                    <div style={{ color: '#36a2eb', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}><FiArrowUpRight /> Chiqim</div>
                                </div>
                                <div className="stat-card" style={{ background: '#252a41', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #f9d56e' }}>
                                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Bot Rivoji Uchun Hissalar</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{formatCurrency(summary.totalTips)}</div>
                                    <div style={{ color: '#f9d56e', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}><FaCoins /> Hissa</div>
                                </div>
                            </div>

                            {/* Volume Chart (Middle) */}
                            <div className="card graph-card" style={{ background: '#252a41', borderRadius: '15px', padding: '15px', minHeight: '250px', maxWidth: '100%', boxSizing: 'border-box' }}>
                                <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#aaa', fontSize: '1rem' }}>Kirim va Chiqim Hajmi</h4>
                                <div style={{ height: '200px', width: '100%', maxWidth: '100%' }}>
                                    <Bar
                                        data={getVolumeStatsData()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 10, font: { size: 11 } } } },
                                            scales: {
                                                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { font: { size: 10 } } },
                                                x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Status Chart (Right) */}
                            <div className="card pie-card" style={{ background: '#252a41', borderRadius: '15px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', boxSizing: 'border-box' }}>
                                <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#aaa', fontSize: '1rem' }}>So'rovlar Holati</h4>
                                <div style={{ height: '180px', width: '100%', maxWidth: '180px' }}>
                                    <Doughnut
                                        data={getRequestStatsData()}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 10, color: '#fff', font: { size: 10 } } } },
                                            borderWidth: 0
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {summary.totalRequests} <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}>Jami</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* SECTION 3.5: Daily User Stats (NEW) */}
            <div className="card" style={{ background: '#252a41', borderRadius: '15px', padding: '25px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCalendarAlt color="#f9d56e" /> Kunlik Statistika
                    </h2>
                    <div className="filters" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="date"
                            className="custom-date-input"
                            value={dailyStatsFilters.startDate}
                            onChange={e => setDailyStatsFilters({ ...dailyStatsFilters, startDate: e.target.value })}
                        />
                        <span style={{ color: '#aaa', fontWeight: 'bold' }}>&rarr;</span>
                        <input
                            type="date"
                            className="custom-date-input"
                            value={dailyStatsFilters.endDate}
                            onChange={e => setDailyStatsFilters({ ...dailyStatsFilters, endDate: e.target.value })}
                        />
                        <Button secondary small onClick={() => { setDailyStatsPage(0); fetchDailyStats(); }}><FiRefreshCw /></Button>
                    </div>
                </div>

                <div className="transaction-list-container">
                    <table className="transaction-table" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Sana</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Top-up (Kirim)</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Transfer (Chiqim)</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Limit Oshirish</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>So'nggi Yangilanish</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyStatsLoading ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}><Loader /></td></tr>
                            ) : dailyStats?.content?.length > 0 ? (
                                dailyStats.content.map((stat, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{stat.date}</td>
                                        <td style={{ padding: '15px', color: '#53bf9d', fontWeight: 'bold' }}>{formatCurrency(stat.dailyTopUpAmount)}</td>
                                        <td style={{ padding: '15px', color: '#36a2eb', fontWeight: 'bold' }}>{formatCurrency(stat.dailyTransferAmount)}</td>
                                        <td style={{ padding: '15px', color: '#f9d56e' }}>{formatCurrency(stat.dailyLimitIncrease)}</td>
                                        <td style={{ padding: '15px', color: '#888' }}>{formatDate(stat.lastUpdated)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Ma'lumot topilmadi</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination for Daily Stats */}
                {dailyStats && dailyStats.totalPages > 1 && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        <Button disabled={dailyStats.first} onClick={() => setDailyStatsPage(p => p - 1)} secondary small>Oldingi</Button>
                        <span style={{ color: '#aaa' }}>Sahifa {dailyStats.number + 1} / {dailyStats.totalPages}</span>
                        <Button disabled={dailyStats.last} onClick={() => setDailyStatsPage(p => p + 1)} secondary small>Keyingi</Button>
                    </div>
                )}
            </div>

            {/* SECTION 4: Transfers History */}
            <div className="card" style={{ background: '#252a41', borderRadius: '15px', padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>O'tkazmalar Tarixi</h2>

                    {/* Compact Filters */}
                    <div className="filters" style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={transferFilters.status}
                            onChange={e => setTransferFilters({ ...transferFilters, status: e.target.value })}
                            style={{ background: '#1a1a2e', color: '#fff', border: '1px solid #444', padding: '8px 12px', borderRadius: '6px' }}
                        >
                            <option value="">Holat: Barchasi</option>
                            <option value="APPROVED">Tasdiqlangan</option>
                            <option value="PENDING">Kutilmoqda</option>
                            <option value="CANCELED">Bekor qilingan</option>
                        </select>
                        <select
                            value={transferFilters.type}
                            onChange={e => setTransferFilters({ ...transferFilters, type: e.target.value })}
                            style={{ background: '#1a1a2e', color: '#fff', border: '1px solid #444', padding: '8px 12px', borderRadius: '6px' }}
                        >
                            <option value="">Tur: Barchasi</option>
                            <option value="TOP_UP">Hisob to'ldirish</option>
                            <option value="WITHDRAWAL">Yechib olish</option>
                        </select>
                        <Button secondary small onClick={() => { setTransferPage(0); fetchTransfers(); }}><FiRefreshCw /></Button>
                    </div>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="transaction-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>ID</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Sana</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Platforma</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Tur</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Summa</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#aaa' }}>Holat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfersLoading ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}><Loader /></td></tr>
                            ) : transfers?.content?.length > 0 ? (
                                transfers.content.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>#{t.id}</td>
                                        <td style={{ padding: '15px', color: '#bbb' }}>{formatDate(t.createdAt)}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem'
                                            }}>{t.platform}</span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                color: t.type === 'TOP_UP' ? '#53bf9d' : '#36a2eb',
                                                display: 'flex', alignItems: 'center', gap: '5px'
                                            }}>
                                                {t.type === 'TOP_UP' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                                                {t.type === 'TOP_UP' ? 'Kirim' : 'Chiqim'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: t.type === 'TOP_UP' ? '#53bf9d' : '#36a2eb' }}>
                                            {t.type === 'TOP_UP' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span className={`status-badge ${t.status.toLowerCase()}`} style={{
                                                padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                                                background: t.status === 'APPROVED' ? 'rgba(83, 191, 157, 0.2)' :
                                                    t.status === 'CANCELED' ? 'rgba(233, 69, 96, 0.2)' :
                                                        t.status === 'PENDING' ? 'rgba(249, 213, 110, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: t.status === 'APPROVED' ? '#53bf9d' :
                                                    t.status === 'CANCELED' ? '#e94560' :
                                                        t.status === 'PENDING' ? '#f9d56e' : '#aaa'
                                            }}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>O'tkazmalar mavjud emas</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {transfers && transfers.totalPages > 1 && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <Button disabled={transfers.first} onClick={() => setTransferPage(p => p - 1)} secondary small>Oldingi</Button>
                        <span style={{ color: '#aaa' }}>Sahifa {transfers.number + 1} / {transfers.totalPages}</span>
                        <Button disabled={transfers.last} onClick={() => setTransferPage(p => p + 1)} secondary small>Keyingi</Button>
                    </div>
                )}
            </div>

            {/* Reuse Modal - keeping it simple */}
            {
                modalOpen && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
                    }}>
                        <div className="modal-content" style={{
                            background: '#252a41', padding: '30px', borderRadius: '15px', width: '450px', maxWidth: '90%', border: '1px solid #444'
                        }}>
                            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>
                                {modalType === 'limit' ? 'Doimiy Limit' :
                                    modalType === 'baseDailyLimit' ? 'Bazaviy Limit' :
                                        modalType === 'withdrawQuota' ? 'Extra Quota Qo\'shish' :
                                            modalType}
                            </h2>
                            <form onSubmit={handleModalSubmit}>
                                <div className="form-group" style={{ marginBottom: '25px' }}>
                                    {modalType === 'baseDailyLimit' && (
                                        <>
                                            {/* System default display */}
                                            <div style={{
                                                background: 'rgba(102, 126, 234, 0.08)',
                                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                                borderRadius: '10px',
                                                padding: '12px 16px',
                                                marginBottom: '12px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Tizim standart limiti:</span>
                                                <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1rem' }}>{formatCurrency(systemDefaultBaseDailyLimit)}</span>
                                            </div>

                                            {/* Current user value display */}
                                            <div style={{
                                                background: 'rgba(83, 191, 157, 0.08)',
                                                border: '1px solid rgba(83, 191, 157, 0.2)',
                                                borderRadius: '10px',
                                                padding: '12px 16px',
                                                marginBottom: '20px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Hozirgi qiymat:</span>
                                                <span style={{ color: '#53bf9d', fontWeight: 'bold', fontSize: '1rem' }}>{formatCurrency(user.baseDailyLimit ?? 0)}</span>
                                            </div>

                                            {/* Percent input */}
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Foiz qiymati (0% - 200%)</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    max="200"
                                                    style={{
                                                        width: '100%',
                                                        padding: '14px',
                                                        paddingRight: '45px',
                                                        borderRadius: '8px',
                                                        background: '#1a1a2e',
                                                        border: '1px solid #444',
                                                        color: '#fff',
                                                        fontSize: '1.3rem',
                                                        fontWeight: 'bold',
                                                        boxSizing: 'border-box'
                                                    }}
                                                    value={baseLimitPercent}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val === '' || (Number(val) >= 0 && Number(val) <= 200)) {
                                                            setBaseLimitPercent(val);
                                                        }
                                                    }}
                                                    placeholder="masalan: 120"
                                                    autoFocus
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    right: '14px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#667eea',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem'
                                                }}>%</span>
                                            </div>
                                            <small style={{ display: 'block', marginTop: '6px', color: '#666', fontSize: '0.75rem' }}>
                                                100% = Kunlik bonus o'tkazma limiti. 120% = 20% ko'proq. 50% = 2 baravar kam.
                                            </small>

                                            {/* Real-time calculation preview */}
                                            {baseLimitPercent !== '' && (
                                                <div style={{
                                                    marginTop: '15px',
                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                    border: '1px solid rgba(102, 126, 234, 0.25)',
                                                    borderRadius: '10px',
                                                    padding: '14px 16px'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Hisoblash:</span>
                                                        <span style={{ color: '#888', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                            {formatCurrency(systemDefaultBaseDailyLimit)} × {baseLimitPercent}%
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                                        paddingTop: '8px'
                                                    }}>
                                                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>Yangi qiymat:</span>
                                                        <span style={{
                                                            color: '#53bf9d',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.3rem'
                                                        }}>
                                                            {formatCurrency(Math.round((Number(baseLimitPercent) / 100) * systemDefaultBaseDailyLimit))}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {modalType !== 'baseDailyLimit' && (
                                        <>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>
                                                {modalType === 'language' ? 'Yangi Til' :
                                                    modalType === 'withdrawQuota' ? 'Qo\'shiladigan Quota Miqdori (UZS)' :
                                                        'Yangi Qiymat'}
                                            </label>
                                            {modalType === 'language' ? (
                                                <select
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1a1a2e', border: '1px solid #444', color: '#fff' }}
                                                    value={modalValue}
                                                    onChange={e => setModalValue(e.target.value)}
                                                >
                                                    <option value="UZ">O'zbekcha (UZ)</option>
                                                    <option value="RU">Ruscha (RU)</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type="number"
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1a1a2e', border: '1px solid #444', color: '#fff', fontSize: '1.2rem' }}
                                                    value={modalValue}
                                                    onChange={e => setModalValue(e.target.value)}
                                                    autoFocus
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <Button type="button" secondary onClick={() => setModalOpen(false)}>Bekor qilish</Button>
                                    <Button type="submit" primary>Saqlash</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserProfilePage;
