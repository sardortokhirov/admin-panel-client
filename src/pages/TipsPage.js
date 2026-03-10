import React, { useState, useEffect } from 'react';
import { getTipConfig, updateTipConfig, getTipStats, getTipTransactions, getTipConfigStatus } from '../api/tipConfigService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, subDays } from 'date-fns';
import {
    FiRefreshCw,
    FiArrowUpCircle,
    FiTrendingUp,
    FiUsers,
    FiDollarSign,
    FiCalendar,
    FiSettings,
    FiActivity,
    FiCheckCircle,
    FiXCircle,
    FiGift,
    FiInfo,
    FiHelpCircle,
    FiZap
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TipsPage = () => {
    // State
    const [formData, setFormData] = useState({
        presets: '',
        minAmount: '',
        minBonusTickets: 0,
        maxBonusTickets: 0,
        bonusTicketsEnabled: false,
        bonusTicketsChance: 100,
        tipLimitIncreaseEnabled: false,
        tipLimitPerAmountUzs: '',
        tipLimitAmountUzs: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [lastSavedData, setLastSavedData] = useState(null);

    const [config, setConfig] = useState(null);

    // Stats and Transactions
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [configStatus, setConfigStatus] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    // Filters
    const [filterPeriod, setFilterPeriod] = useState('30d');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const fetchData = async () => {
        setDataLoading(true);
        try {
            let params = {};
            if (filterPeriod === 'custom' && startDate && endDate) {
                params = {
                    startDate: format(startDate, "yyyy-MM-dd'T'00:00:00"),
                    endDate: format(endDate, "yyyy-MM-dd'T'23:59:59")
                };
            } else if (filterPeriod !== 'custom') {
                const days = parseInt(filterPeriod.replace("d", ""));
                params = {
                    startDate: format(subDays(new Date(), days), "yyyy-MM-dd'T'00:00:00"),
                };
            }

            const [configRes, statsRes, txRes, statusRes] = await Promise.all([
                getTipConfig().catch(e => ({ data: null })), // might be 404
                getTipStats(params).catch(e => ({ data: null })),
                getTipTransactions(params).catch(e => ({ data: [] })),
                getTipConfigStatus().catch(e => ({ data: null }))
            ]);

            if (configRes.data) {
                setConfig(configRes.data);
                setFormData({
                    presets: configRes.data.presets || '',
                    minAmount: configRes.data.minAmount || '',
                    minBonusTickets: configRes.data.minBonusTickets || 0,
                    maxBonusTickets: configRes.data.maxBonusTickets || 0,
                    bonusTicketsEnabled: configRes.data.bonusTicketsEnabled || false,
                    bonusTicketsChance: configRes.data.bonusTicketsChance || 100,
                    tipLimitIncreaseEnabled: configRes.data.tipLimitIncreaseEnabled || false,
                    tipLimitPerAmountUzs: configRes.data.tipLimitPerAmountUzs || '',
                    tipLimitAmountUzs: configRes.data.tipLimitAmountUzs || ''
                });
            } else {
                setConfig({}); // init empty
            }

            if (statsRes.data) setStats(statsRes.data);
            if (txRes.data) setTransactions(txRes.data);
            if (statusRes.data) setConfigStatus(statusRes.data);

        } catch (err) {
            console.error(err);
            setError('Ma\'lumotlarni yuklashda xato yuz berdi.');
        } finally {
            setLoading(false);
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (filterPeriod !== 'custom' || (filterPeriod === 'custom' && startDate && endDate)) {
            fetchData();
        }
    }, [filterPeriod, startDate, endDate]);

    const handleFilterChange = (period) => {
        setFilterPeriod(period);
        setDateRange([null, null]);
    };

    const handleCustomFilter = (update) => {
        setDateRange(update);
        setFilterPeriod("custom");
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccessMsg('');

        try {
            const dataToSave = {
                presets: formData.presets,
                minAmount: Number(formData.minAmount),
                minBonusTickets: Number(formData.minBonusTickets),
                maxBonusTickets: Number(formData.maxBonusTickets),
                bonusTicketsEnabled: formData.bonusTicketsEnabled,
                bonusTicketsChance: Number(formData.bonusTicketsChance),
                tipLimitIncreaseEnabled: formData.tipLimitIncreaseEnabled,
                tipLimitPerAmountUzs: formData.tipLimitPerAmountUzs ? Number(formData.tipLimitPerAmountUzs) : null,
                tipLimitAmountUzs: formData.tipLimitAmountUzs ? Number(formData.tipLimitAmountUzs) : null
            };
            await updateTipConfig(dataToSave);
            setLastSavedData(dataToSave);
            setSuccessMsg('Bot rivoji sozlamalari muvaffaqiyatli saqlandi!');
            // Refresh status after save
            const statusUpdate = await getTipConfigStatus().catch(e => ({ data: null }));
            if (statusUpdate.data) setConfigStatus(statusUpdate.data);

            setTimeout(() => {
                setSuccessMsg('');
                setLastSavedData(null);
            }, 6000);
        } catch (err) {
            setError('Saqlashda xato yuz berdi: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleAddPreset = (value) => {
        if (!value) return;
        const currentPresets = formData.presets ? formData.presets.split(',').map(s => s.trim()) : [];
        if (!currentPresets.includes(value.trim())) {
            const newPresets = [...currentPresets, value.trim()].join(',');
            setFormData({ ...formData, presets: newPresets });
        }
    };

    const handleRemovePreset = (val) => {
        const currentPresets = formData.presets.split(',').map(s => s.trim());
        const newPresets = currentPresets.filter(p => p !== val).join(',');
        setFormData({ ...formData, presets: newPresets });
    };

    const StatCard = ({ icon, title, value, detail, color, iconBg }) => (
        <div className="stat-card-premium" style={{ color }}>
            <div className="stat-icon-wrapper" style={{ '--icon-color': color, '--icon-color-rgb': iconBg }}>
                {icon}
            </div>
            <div className="stat-content">
                <div className="stat-label">{title}</div>
                <div className="stat-value">{value}</div>
                {detail && <div className="stat-detail">{detail}</div>}
            </div>
        </div>
    );

    if (loading) return <Loader />;

    const avgContribution = stats?.totalTipsCount > 0
        ? Math.round(stats.totalTipsAmount / stats.totalTipsCount)
        : 0;

    const topDay = stats?.tipsAmountByDate
        ? Object.entries(stats.tipsAmountByDate).sort((a, b) => b[1] - a[1])[0]
        : null;

    return (
        <div className="premium-tips-page">
            <header className="page-header">
                <div className="header-title">
                    <h1>Bot Rivoji Analytics</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Botni qo'llab-quvvatlash va rivojlantirish statistikasi</p>
                </div>

                <div className="filter-controls">
                    <div className="quick-filters">
                        {['7d', '30d', '90d'].map(period => (
                            <button
                                key={period}
                                onClick={() => handleFilterChange(period)}
                                className={filterPeriod === period ? "active" : ""}
                            >
                                {period === '7d' ? '7 Kun' : period === '30d' ? '30 Kun' : '90 Kun'}
                            </button>
                        ))}
                    </div>
                    <div className="date-picker-wrapper">
                        <FiCalendar className="calendar-icon" />
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleCustomFilter}
                            isClearable={true}
                            placeholderText="Maxsus oraliq"
                            className={`custom-datepicker ${filterPeriod === "custom" ? "active" : ""}`}
                            portalId="root"
                        />
                    </div>
                    <button onClick={fetchData} className="refresh-btn" title="Yangilash">
                        <FiRefreshCw />
                    </button>
                </div>
            </header>

            <div className="stats-grid-premium">
                <StatCard
                    icon={<FiDollarSign />}
                    title="Jami Tushum"
                    value={`${(stats?.totalTipsAmount || 0).toLocaleString()} UZS`}
                    detail={<><FiTrendingUp /> O'sish kuzatilmoqda</>}
                    color="#10b981"
                    iconBg="16, 185, 129"
                />
                <StatCard
                    icon={<FaCoins />}
                    title="Hissalar Soni"
                    value={(stats?.totalTipsCount || 0).toLocaleString()}
                    detail="Tasdiqlangan to'lovlar"
                    color="#3b82f6"
                    iconBg="59, 130, 246"
                />
                <StatCard
                    icon={<FiActivity />}
                    title="O'rtacha Hissa"
                    value={`${avgContribution.toLocaleString()} UZS`}
                    detail="Har bir foydalanuvchidan"
                    color="#f59e0b"
                    iconBg="245, 158, 11"
                />
                <StatCard
                    icon={<FiCalendar />}
                    title="Eng Faol Kun"
                    value={topDay ? topDay[0].split('-').reverse().join('.') : '---'}
                    detail={topDay ? `${topDay[1].toLocaleString()} UZS` : 'Ma\'lumot yo\'q'}
                    color="#8b5cf6"
                    iconBg="139, 92, 246"
                />
            </div>

            <div className="main-chart-wrapper">
                <div className="chart-header">
                    <h3><FiTrendingUp style={{ color: '#3b82f6' }} /> Revenue Growth (Hissa O'sishi)</h3>
                </div>
                <div style={{ height: '400px', width: '100%' }}>
                    {!dataLoading && stats?.tipsAmountByDate ? (
                        <Line
                            data={{
                                labels: Object.keys(stats.tipsAmountByDate).sort(),
                                datasets: [{
                                    label: "Kunlik Tushum (UZS)",
                                    data: Object.keys(stats.tipsAmountByDate).sort().map(key => stats.tipsAmountByDate[key]),
                                    borderColor: '#3b82f6',
                                    borderWidth: 3,
                                    pointBackgroundColor: '#3b82f6',
                                    pointBorderColor: 'rgba(255,255,255,0.8)',
                                    pointHoverRadius: 6,
                                    backgroundColor: (context) => {
                                        const chart = context.chart;
                                        const { ctx, chartArea } = chart;
                                        if (!chartArea) return null;
                                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                                        return gradient;
                                    },
                                    fill: true,
                                    tension: 0.4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        titleColor: '#fff',
                                        bodyColor: '#fff',
                                        padding: 12,
                                        cornerRadius: 8,
                                        displayColors: false,
                                        callbacks: {
                                            label: (context) => `${context.parsed.y.toLocaleString()} UZS`
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                                        ticks: { color: '#94a3b8', callback: (val) => val >= 1000 ? `${val / 1000}k` : val }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: '#94a3b8' }
                                    }
                                }
                            }}
                        />
                    ) : <Loader />}
                </div>
            </div>

            <div className="content-split-row">
                <div className="settings-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <FiSettings /> Bot Rivoji Sozlamalari
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Foydalanuvchilarga ko'rinadigan tugmalar va minimal to'lov miqdorini tahrirlash.
                    </p>

                    {configStatus && (
                        <div className={`status-summary-card ${configStatus.bonusTicketsEnabled ? 'enabled' : 'disabled'}`} style={{
                            background: configStatus.bonusTicketsEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            border: `1px solid ${configStatus.bonusTicketsEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`,
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div className="status-icon">
                                {configStatus.bonusTicketsEnabled ?
                                    <FiCheckCircle style={{ color: '#10b981', fontSize: '1.5rem' }} /> :
                                    <FiXCircle style={{ color: '#94a3b8', fontSize: '1.5rem' }} />
                                }
                            </div>
                            <div className="status-text">
                                <div style={{ fontWeight: '600', color: configStatus.bonusTicketsEnabled ? '#10b981' : '#94a3b8', fontSize: '0.9rem' }}>
                                    Status: {configStatus.statusCode.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    {configStatus.statusDescription}
                                    {configStatus.tipLimitSummary && (
                                        <div style={{ marginTop: '5px', color: '#fff', fontSize: '0.85rem' }}>
                                            <FiTrendingUp style={{ marginRight: '5px', color: '#3b82f6' }} />
                                            Limit O'sishi: <strong>{configStatus.tipLimitSummary}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                    {successMsg && lastSavedData ? (
                        <div className="save-summary-card">
                            <div className="summary-header">
                                <FiCheckCircle className="success-icon" />
                                <div className="summary-title-group">
                                    <h4>{successMsg}</h4>
                                    <p>Saqlangan ma'lumotlar tafsiloti:</p>
                                </div>
                            </div>
                            <div className="summary-content">
                                <div className="summary-item">
                                    <span className="label">Presets</span>
                                    <span className="value">{lastSavedData.presets || '---'}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Minimal Miqdor</span>
                                    <span className="value">{Number(lastSavedData.minAmount).toLocaleString()} UZS</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Bonus Holati</span>
                                    <span className={`value ${lastSavedData.bonusTicketsEnabled ? 'enabled' : 'disabled'}`}>
                                        {lastSavedData.bonusTicketsEnabled ? 'Yoqilgan' : 'O\'chirilgan'}
                                    </span>
                                </div>
                                {lastSavedData.bonusTicketsEnabled && (
                                    <>
                                        <div className="summary-item">
                                            <span className="label">Bilet Oralig'i</span>
                                            <span className="value">{lastSavedData.minBonusTickets} - {lastSavedData.maxBonusTickets}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="label">Ehtimollik</span>
                                            <span className="value">{lastSavedData.bonusTicketsChance}%</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button
                                type="button"
                                className="close-summary"
                                onClick={() => {
                                    setSuccessMsg('');
                                    setLastSavedData(null);
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    ) : (
                        successMsg && <div className="form__success" style={{ marginBottom: '1rem' }}>{successMsg}</div>
                    )}

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-group-premium">
                            <label>Standart Tugmalar (Presets)</label>
                            <div className="presets-ui-wrapper">
                                <div className="preset-tags-container">
                                    {formData.presets.split(',').filter(x => x.trim()).map((p, idx) => (
                                        <div key={idx} className="preset-tag">
                                            <span>{p}</span>
                                            <button type="button" onClick={() => handleRemovePreset(p)}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="add-preset-field">
                                    <input
                                        type="number"
                                        placeholder="Yangi summa..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddPreset(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const input = e.currentTarget.previousSibling;
                                            handleAddPreset(input.value);
                                            input.value = '';
                                        }}
                                    >
                                        Qo'shish
                                    </button>
                                </div>
                            </div>
                            <small className="form__hint">Tugmalar ro'yxatini shakllantiring (Masalan: 5000, 10000, 20000)</small>
                        </div>

                        <div className="form-group-premium">
                            <label>Minimal Miqdor (UZS)</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    name="minAmount"
                                    value={formData.minAmount}
                                    onChange={handleChange}
                                    placeholder="Masalan: 5000"
                                    required
                                />
                            </div>
                            <small className="form__hint">Botdagi eng kichik to'lov summasi</small>
                        </div>

                        <div className="bonus-system-header" style={{ marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FiGift style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Bonus Tizimi (Tasodifiy biletlar)</h4>
                        </div>

                        <div className="bonus-explanation-card" style={{
                            background: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', gap: '0.8rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <FiInfo style={{ flexShrink: 0, marginTop: '3px', color: '#3b82f6', fontSize: '1.1rem' }} />
                                <div>
                                    Ushbu bo'limda foydalanuvchilar botga "Hissa" (Tip) yuborganlarida ularga beriladigan <strong>bepul bonus biletlar</strong>ni boshqarishingiz mumkin.
                                    Tizim avtomatik ravishda siz belgilagan oraliqda tasodifiy miqdorni tanlaydi.
                                </div>
                            </div>
                        </div>

                        <div className="form-group-premium bonus-logic-panel-advanced" style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            border: '1.5px solid rgba(255,255,255,0.07)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: formData.bonusTicketsEnabled ? '#10b981' : '#fff' }}>
                                        {formData.bonusTicketsEnabled ? 'Bonus Tizimi FAQOL' : 'Bonus Tizimi O\'CHIK'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Barcha foydalanuvchilar uchun bonuslarni yoqish/o'chirish</span>
                                </div>
                                <label className="premium-toggle">
                                    <input
                                        type="checkbox"
                                        name="bonusTicketsEnabled"
                                        checked={formData.bonusTicketsEnabled}
                                        onChange={handleChange}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            {formData.bonusTicketsEnabled ? (
                                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="form-group-premium">
                                            <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Minimal Bilet</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="number"
                                                    name="minBonusTickets"
                                                    value={formData.minBonusTickets}
                                                    onChange={handleChange}
                                                    min="0"
                                                    style={{ background: '#0f172a', border: '1px solid #334155' }}
                                                />
                                            </div>
                                            <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Eng kam yutilishi mumkin bo'lgan bilet soni</small>
                                        </div>
                                        <div className="form-group-premium">
                                            <label style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Maksimal Bilet</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="number"
                                                    name="maxBonusTickets"
                                                    value={formData.maxBonusTickets}
                                                    onChange={handleChange}
                                                    min="0"
                                                    style={{ background: '#0f172a', border: '1px solid #334155' }}
                                                />
                                            </div>
                                            <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Eng ko'p yutilishi mumkin bo'lgan bilet soni</small>
                                        </div>
                                    </div>

                                    <div className="chance-control-box" style={{
                                        padding: '1.25rem',
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 100%)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <FiZap style={{ color: '#f59e0b' }} />
                                                <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>Yutish Ehtimoli</label>
                                            </div>
                                            <div style={{
                                                color: '#10b981',
                                                background: 'rgba(16, 185, 129, 0.15)',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontWeight: '800',
                                                fontSize: '1.1rem',
                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                            }}>{formData.bonusTicketsChance}%</div>
                                        </div>
                                        <input
                                            type="range"
                                            name="bonusTicketsChance"
                                            min="0"
                                            max="100"
                                            value={formData.bonusTicketsChance}
                                            onChange={handleChange}
                                            className="premium-range-slider"
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                                            <span>Kam (0%)</span>
                                            <span>O'rtacha</span>
                                            <span>Har doim (100%)</span>
                                        </div>
                                    </div>

                                    <div className="example-scenario-box" style={{
                                        marginTop: '0.5rem',
                                        padding: '1.2rem',
                                        background: 'rgba(255, 193, 7, 0.03)',
                                        border: '1px dashed rgba(255, 193, 7, 0.2)',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem' }}>
                                            <FiHelpCircle /> Ishlash tartibi (Misol):
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                                            Agar foydalanuvchi hissa yuborsa, u <strong>{formData.bonusTicketsChance === "100" ? "har doim" : formData.bonusTicketsChance + "% ehtimol bilan"}</strong>
                                            {" "} tasodifiy <strong>{formData.minBonusTickets} tadan {formData.maxBonusTickets} tagacha</strong> gacha bonus bilet yutib oladi.
                                            {formData.bonusTicketsChance !== "100" && ` Qolgan ${100 - formData.bonusTicketsChance}% holatlarda esa bonus berilmaydi.`}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                                    <FiXCircle style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                                    <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>Bonus tizimi hozirda faol emas</div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Bonuslarni yoqish foydalanuvchilarni faolroq bo'lishiga yordam beradi.</div>
                                </div>
                            )}
                        </div>

                        {/* Tip Limit Increase Section - REDESIGNED UX */}
                        <div className="bonus-system-header" style={{ marginTop: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FiTrendingUp style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Hissa uchun Limit (Doimiy)</h4>
                        </div>

                        <div className="limit-logic-premium-card" style={{
                            background: formData.tipLimitIncreaseEnabled ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%)' : 'rgba(255,255,255,0.02)',
                            padding: '1.5rem',
                            border: `1px solid ${formData.tipLimitIncreaseEnabled ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: '24px',
                            marginBottom: '2rem',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            {/* Toggle Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: formData.tipLimitIncreaseEnabled ? '2rem' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: formData.tipLimitIncreaseEnabled ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FiZap style={{ color: formData.tipLimitIncreaseEnabled ? '#3b82f6' : '#64748b' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#fff' }}>Avtomatik Limit Oshirish</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Har bir Tip uchun doimiy limit sovg'a qilish</div>
                                    </div>
                                </div>
                                <label className="premium-toggle">
                                    <input
                                        type="checkbox"
                                        name="tipLimitIncreaseEnabled"
                                        checked={formData.tipLimitIncreaseEnabled}
                                        onChange={handleChange}
                                    />
                                    <span className="slider round" style={{ background: formData.tipLimitIncreaseEnabled ? '#3b82f6' : '#334155' }}></span>
                                </label>
                            </div>

                            {formData.tipLimitIncreaseEnabled && (
                                <div className="animate-fade-in">
                                    {/* Sentence-like UI */}
                                    <div className="rule-sentence-ui" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px',
                                        padding: '20px',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#94a3b8', fontWeight: '500' }}>Har har bir</span>
                                            <div style={{ position: 'relative', width: '120px' }}>
                                                <input
                                                    type="number"
                                                    name="tipLimitPerAmountUzs"
                                                    value={formData.tipLimitPerAmountUzs}
                                                    onChange={handleChange}
                                                    placeholder="1000"
                                                    style={{
                                                        width: '100%', padding: '8px 12px', background: '#0f172a',
                                                        border: '2px solid #334155', borderRadius: '8px', color: '#fff', textAlign: 'center', fontWeight: 'bold'
                                                    }}
                                                />
                                            </div>
                                            <span style={{ color: '#94a3b8', fontWeight: '500' }}>UZS yuborilgan tip uchun,</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#94a3b8', fontWeight: '500' }}>Foydalanuvchi limitini</span>
                                            <div style={{ position: 'relative', width: '100px' }}>
                                                <input
                                                    type="number"
                                                    name="tipLimitAmountUzs"
                                                    value={formData.tipLimitAmountUzs}
                                                    onChange={handleChange}
                                                    placeholder="50"
                                                    style={{
                                                        width: '100%', padding: '8px 12px', background: '#0f172a',
                                                        border: '2px solid #3b82f6', borderRadius: '8px', color: '#3b82f6', textAlign: 'center', fontWeight: 'bold'
                                                    }}
                                                />
                                            </div>
                                            <span style={{ color: '#fff', fontWeight: '700' }}>UZS ga oshirib berish.</span>
                                        </div>
                                    </div>

                                    {/* Real-time Visualization (SIMULATION) */}
                                    <div className="logic-visualization" style={{ marginTop: '24px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                                            Vizual Tasvir (Simulyatsiya)
                                        </div>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '15px',
                                            background: 'rgba(59, 130, 246, 0.05)', padding: '20px', borderRadius: '16px', border: '1px dashed rgba(59, 130, 246, 0.2)'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Tip Miqdori</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>10 000 UZS</div>
                                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px' }}>
                                                    <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '2px' }}></div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ color: '#3b82f6', fontSize: '1.2rem' }}>&rarr;</div>
                                                <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: '700' }}>LOGIKA</div>
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Doimiy Limit +</div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#3b82f6' }}>
                                                    {formData.tipLimitPerAmountUzs && formData.tipLimitAmountUzs ?
                                                        (Math.floor(10000 / Number(formData.tipLimitPerAmountUzs)) * Number(formData.tipLimitAmountUzs)).toLocaleString() : '0'
                                                    } UZS
                                                </div>
                                                <div style={{ width: '100%', height: '4px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px', marginTop: '8px' }}>
                                                    <div style={{ width: '70%', height: '100%', background: '#3b82f6', borderRadius: '2px', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                                            * Yuqoridagi misol 10 000 UZS tip yuborilgandagi natijani ko'rsatmoqda
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form__actions">
                            <Button primary type="submit" disabled={saving}>
                                {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="activity-panel">
                    <div className="panel-header">
                        <h3><FiActivity /> Oxirgi Hissalar</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        {dataLoading ? <Loader /> : transactions.length > 0 ? (
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Sana</th>
                                        <th>Foydalanuvchi</th>
                                        <th>Miqdor</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id}>
                                            <td>#{t.id}</td>
                                            <td>{format(new Date(t.createdAt), 'dd.MM.yyyy HH:mm')}</td>
                                            <td><span className="user-id">ChatID: {t.chatId}</span></td>
                                            <td><span className="amount-badge">+{Number(t.uniqueAmount).toLocaleString()}</span></td>
                                            <td>
                                                <span className={`status-badge status--${t.status.toLowerCase()}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                Ma'lumot topilmadi
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TipsPage;
