// src/pages/SystemConfigPage.js
import React, { useState, useEffect, useCallback } from 'react';
import systemConfigService from '../api/systemConfigService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiSave, FiClock, FiSettings } from 'react-icons/fi';
import { format } from 'date-fns';

const SystemConfigPage = () => {
    const [config, setConfig] = useState(null);
    const [formState, setFormState] = useState({
        topUpMinAmount: 5000,
        topUpMaxAmount: 10000000,
        bonusTopUpMinAmount: 3600,
        bonusTopUpMaxAmount: 100000,
        minTickets: 5,
        maxTickets: 400,
        referralCommissionPercentage: 0.001,
        ticketCalculationAmount: 10000
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchConfig = useCallback(async () => {
        try {
            setError('');
            const data = await systemConfigService.getLatestConfig();
            if (data) {
                setConfig(data);
                setFormState({
                    topUpMinAmount: data.topUpMinAmount,
                    topUpMaxAmount: data.topUpMaxAmount,
                    bonusTopUpMinAmount: data.bonusTopUpMinAmount,
                    bonusTopUpMaxAmount: data.bonusTopUpMaxAmount,
                    minTickets: data.minTickets,
                    maxTickets: data.maxTickets,
                    referralCommissionPercentage: data.referralCommissionPercentage,
                    ticketCalculationAmount: data.ticketCalculationAmount
                });
            }
        } catch (err) {
            console.error("Failed to fetch system config:", err);
            // If it's 404, we keep the default form state and don't show an error
            if (err.response && err.response.status === 404) {
               console.log("No config found, using defaults.");
            } else if (err.response && err.response.status === 401) {
                setError("Login xatosi (401 Unauthorized). Iltimos backend ruxsatlarini tekshiring.");
            } else {
                setError("Tizim sozlamalarini yuklashda xatolik yuz berdi: " + (err.message || "No-malum xatolik"));
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            // According to task context:
            // "PUT /api/config/{id} ... Path param: id (integer) ... Backend forces id onto payload"
            // "POST /api/config ... omit on create if appending history"
            
            // We'll use POST to create a NEW version (appending history) as standard for this kind of "historical" config
            // But the instructions say PUT /api/config/{id} exists too.
            // If we have an existing ID, we can update it. If not, we POST.
            
            if (config && config.id) {
                await systemConfigService.updateConfig(config.id, formState);
                setSuccessMessage("Sozlamalar yangilandi!");
            } else {
                await systemConfigService.createConfig(formState);
                setSuccessMessage("Yangi sozlamalar yaratildi!");
            }
            
            fetchConfig();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError("Saqlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="page-container system-config-page">
            <div className="page-header">
                <h1> <FiSettings /> Tizim Sozlamalari</h1>
            </div>

            <div className="config-panel">
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="form__success">{successMessage}</p>}

                {config && (
                    <div className="current-config-info">
                        <p className="update-info">
                            <FiClock />
                            So'nggi yangilanish: {format(new Date(config.createdAt), "dd-MM-yyyy HH:mm")} (ID: {config.id})
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form config-form">
                    <div className="form-grid">
                        <div className="form__group">
                            <label>Minimal To'lov (Min Top-up)</label>
                            <input
                                type="number"
                                name="topUpMinAmount"
                                value={formState.topUpMinAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Maksimal To'lov (Max Top-up)</label>
                            <input
                                type="number"
                                name="topUpMaxAmount"
                                value={formState.topUpMaxAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Minimal Bonus To'lovi</label>
                            <input
                                type="number"
                                step="any"
                                name="bonusTopUpMinAmount"
                                value={formState.bonusTopUpMinAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Maksimal Bonus To'lovi</label>
                            <input
                                type="number"
                                step="any"
                                name="bonusTopUpMaxAmount"
                                value={formState.bonusTopUpMaxAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Minimal Chiptalar Soni</label>
                            <input
                                type="number"
                                name="minTickets"
                                value={formState.minTickets}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Maksimal Chiptalar Soni</label>
                            <input
                                type="number"
                                name="maxTickets"
                                value={formState.maxTickets}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Referral Komissiya (%) (masalan: 0.001)</label>
                            <input
                                type="number"
                                step="0.0001"
                                name="referralCommissionPercentage"
                                value={formState.referralCommissionPercentage}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form__group">
                            <label>Chipta Hisoblash Miqdori (Divisor)</label>
                            <input
                                type="number"
                                name="ticketCalculationAmount"
                                value={formState.ticketCalculationAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" primary disabled={isSubmitting}>
                            <FiSave /> {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                        </Button>
                        
                        {/* Optional button to Create New (History) if we want to force POST even if current exists */}
                        {config && (
                            <Button 
                                type="button" 
                                onClick={async () => {
                                    if(window.confirm("Yangi versiya sifatida saqlamoqchimisiz?")) {
                                        setIsSubmitting(true);
                                        try {
                                             await systemConfigService.createConfig(formState);
                                             setSuccessMessage("Yangi versiya saqlandi!");
                                             fetchConfig();
                                        } catch(e) { setError("Xatolik!"); }
                                        finally { setIsSubmitting(false); }
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                Yangi Versiya Sifatida Saqlash
                            </Button>
                        )}
                    </div>
                </form>
            </div>
            
        </div>
    );
};

export default SystemConfigPage;
