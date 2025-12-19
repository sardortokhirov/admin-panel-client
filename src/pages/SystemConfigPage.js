// src/pages/SystemConfigPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { systemConfigService } from '../api/systemConfigService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiSave, FiRefreshCw, FiSettings, FiInfo, FiZap, FiPercent } from 'react-icons/fi';

const SystemConfigPage = () => {
    const [config, setConfig] = useState({
        topUpMinAmount: 0,
        topUpMaxAmount: 0,
        bonusTopUpMinAmount: 0,
        bonusTopUpMaxAmount: 0,
        minTickets: 0,
        maxTickets: 0,
        withdrawalCommissionPercentage: 0,
        referralCommissionPercentage: 0,
        ticketCalculationAmount: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchConfig = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await systemConfigService.getConfiguration();
            if (response.data) {
                setConfig(response.data);
            }
        } catch (err) {
            setError('Tizim sozlamalarini yuklab bo\'lmadi. Avtorizatsiyani tekshiring.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;

        // Prevent negative numbers
        if (type === 'number' && newValue < 0) newValue = 0;

        setConfig(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError('');
            setSuccess('');

            const response = await systemConfigService.updateConfiguration(config);
            setConfig(response.data);
            setSuccess('Sozlamalar muvaffaqiyatli saqlandi!');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Sozlamalarni saqlashda xatolik yuz berdi.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="page-container system-config-page">
            <div className="page-header">
                <div className="header-title">
                    <FiSettings className="header-icon" />
                    <div>
                        <h1>Tizim Sozlamalari</h1>
                        <p className="subtitle">Biznes qoidalari va limitlarni boshqarish</p>
                    </div>
                </div>
                <Button onClick={fetchConfig} disabled={isSaving} className="refresh-btn">
                    <FiRefreshCw className={isSaving ? 'spin' : ''} /> {isSaving ? 'Yangilanmoqda...' : 'Yangilash'}
                </Button>
            </div>

            {error && <div className="error-message mb-1">{error}</div>}
            {success && <div className="success-message mb-1">{success}</div>}

            <form onSubmit={handleSubmit} className="config-form">
                <div className="config-section">
                    <div className="section-header">
                        <FiZap /> <h3>To'lov Limitlari</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form__group">
                            <label>Minimal to'ldirish summasi</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    name="topUpMinAmount"
                                    value={config.topUpMinAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">UZS</span>
                            </div>
                        </div>

                        <div className="form__group">
                            <label>Maksimal to'ldirish summasi</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    name="topUpMaxAmount"
                                    value={config.topUpMaxAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">UZS</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <div className="section-header">
                        <FiZap /> <h3>Bonus Limitlari</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form__group">
                            <label>Bonus uchun minimal summa</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    step="0.01"
                                    name="bonusTopUpMinAmount"
                                    value={config.bonusTopUpMinAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">UZS</span>
                            </div>
                        </div>

                        <div className="form__group">
                            <label>Bonus uchun maksimal summa</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    step="0.01"
                                    name="bonusTopUpMaxAmount"
                                    value={config.bonusTopUpMaxAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">UZS</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <div className="section-header">
                        <FiInfo /> <h3>Bilet va Lotereya</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form__group">
                            <label>Minimal biletlar soni</label>
                            <input
                                type="number"
                                name="minTickets"
                                value={config.minTickets}
                                onChange={handleInputChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form__group">
                            <label>Maksimal biletlar soni</label>
                            <input
                                type="number"
                                name="maxTickets"
                                value={config.maxTickets}
                                onChange={handleInputChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form__group">
                            <label>Bilet hisoblash summasi</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    name="ticketCalculationAmount"
                                    value={config.ticketCalculationAmount}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">UZS</span>
                            </div>
                            <small>Har qancha summa uchun 1 ta bilet berilishini belgilaydi</small>
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <div className="section-header">
                        <FiPercent /> <h3>Komissiya Foizlari</h3>
                    </div>
                    <div className="form-grid">
                        <div className="form__group">
                            <label>Yechib olish komissiyasi</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    step="0.0001"
                                    name="withdrawalCommissionPercentage"
                                    value={config.withdrawalCommissionPercentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">%</span>
                            </div>
                            <small>Masalan: 0.01 = 1%</small>
                        </div>

                        <div className="form__group">
                            <label>Referal komissiyasi</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    step="0.0001"
                                    name="referralCommissionPercentage"
                                    value={config.referralCommissionPercentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                                <span className="currency">%</span>
                            </div>
                            <small>Masalan: 0.001 = 0.1%</small>
                        </div>
                    </div>
                </div>

                <div className="form-actions-bar">
                    <Button type="submit" primary disabled={isSaving} className="save-btn">
                        <FiSave /> {isSaving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
                    </Button>
                </div>
            </form>

            <style jsx="true">{`
                .system-config-page {
                    color: #e0e0e0;
                    padding-bottom: 80px;
                }
                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                }
                .header-icon {
                    font-size: 2.2rem;
                    color: #e94560;
                    filter: drop-shadow(0 0 10px rgba(233, 69, 96, 0.4));
                }
                .header-title h1 {
                    font-size: 1.8rem;
                    margin: 0;
                }
                .subtitle {
                    color: #a0a0a0;
                    margin: 0;
                    font-size: 0.85rem;
                }
                .refresh-btn {
                    padding: 0.8rem 1.5rem !important;
                    height: 48px !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 0.8rem !important;
                    color: #fff !important;
                    font-weight: 500 !important;
                    border-radius: 12px !important;
                }
                .refresh-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.12) !important;
                    border-color: #e94560 !important;
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                }
                .refresh-btn .header-icon {
                    font-size: 1.2rem;
                }
                .config-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.8rem;
                    margin-top: 1rem;
                }
                .config-section {
                    background: #16213e;
                    border-radius: 16px;
                    padding: 1.8rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                }
                .config-section:hover {
                    border-color: rgba(233, 69, 96, 0.3);
                    background: #1a264a;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 1.8rem;
                    color: #e94560;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 1rem;
                }
                .section-header h3 {
                    margin: 0;
                    font-size: 1.05rem;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    font-weight: 600;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                }
                .form__group label {
                    display: block;
                    margin-bottom: 0.8rem;
                    font-size: 0.9rem;
                    color: #a0a0a0;
                    font-weight: 500;
                }
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-wrapper input {
                    width: 100%;
                    padding: 0.9rem 1.2rem;
                    padding-right: 4.5rem;
                    background: #0f3460;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .input-wrapper input:focus {
                    border-color: #e94560;
                    box-shadow: 0 0 15px rgba(233, 69, 96, 0.2);
                    background: #16213e;
                }
                .currency {
                    position: absolute;
                    right: 1.2rem;
                    color: #e94560;
                    font-weight: 600;
                    font-size: 0.8rem;
                    background: rgba(233, 69, 96, 0.1);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }
                small {
                    display: block;
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: #666;
                }
                .form-actions-bar {
                    position: fixed;
                    bottom: 0;
                    left: 260px; /* Offset for sidebar if exists */
                    right: 0;
                    background: rgba(26, 26, 46, 0.8);
                    backdrop-filter: blur(15px);
                    padding: 1.2rem 3rem;
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    z-index: 1000;
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
                }
                .save-btn {
                    min-width: 280px;
                    height: 52px;
                    font-size: 1rem !important;
                    font-weight: 600 !important;
                    background: linear-gradient(135deg, #e94560 0%, #c62828 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    box-shadow: 0 8px 20px rgba(233, 69, 96, 0.3) !important;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 0.8rem !important;
                }
                .save-btn:hover:not(:disabled) {
                    transform: scale(1.02) translateY(-3px);
                    box-shadow: 0 12px 25px rgba(233, 69, 96, 0.4) !important;
                    filter: brightness(1.1);
                }
                .save-btn:active {
                    transform: scale(0.98);
                }
                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: #555 !important;
                    box-shadow: none !important;
                }
                .success-message, .error-message {
                    padding: 1.2rem 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-weight: 500;
                    animation: slideDown 0.4s ease;
                }
                .success-message {
                    background: rgba(83, 191, 157, 0.1);
                    color: #53bf9d;
                    border: 1px solid rgba(83, 191, 157, 0.2);
                }
                .error-message {
                    background: rgba(255, 92, 92, 0.1);
                    color: #ff5c5c;
                    border: 1px solid rgba(255, 92, 92, 0.2);
                }
                .mb-1 { margin-bottom: 2rem; }
                .spin { animation: spin 0.8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideDown { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }

                /* Media Queries for full adaptivity */
                @media (max-width: 1024px) {
                    .form-actions-bar {
                        left: 0;
                        padding: 1rem 2rem;
                    }
                }
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .refresh-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    .header-title h1 {
                        font-size: 1.5rem;
                    }
                    .config-section {
                        padding: 1.2rem;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 1.2rem;
                    }
                    .form-actions-bar {
                        padding: 0.8rem 1rem;
                    }
                    .save-btn {
                        width: 100%;
                        min-width: unset;
                    }
                    .system-config-page {
                        padding-bottom: 100px;
                    }
                }
                @media (max-width: 480px) {
                    .header-icon {
                        font-size: 1.8rem;
                    }
                    .section-header h3 {
                        font-size: 0.95rem;
                    }
                    .input-wrapper input {
                        padding: 0.8rem 1rem;
                        font-size: 0.95rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default SystemConfigPage;
