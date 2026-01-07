import React, { useState, useEffect, useCallback } from 'react';
import { exchangeRateService } from '../api/exchangeRateService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

const CurrencyPage = () => {
    const [rate, setRate] = useState(null);
    const [formState, setFormState] = useState({ uzsToRub: '', rubToUzs: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchLatestRate = useCallback(async () => {
        try {
            setError('');
            const response = await exchangeRateService.getLatestRate();
            setRate(response.data);
            // Pre-fill the form with the current rates for easy editing
            setFormState({
                uzsToRub: response.data.uzsToRub,
                rubToUzs: response.data.rubToUzs,
            });
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError("Hozircha birorta ham valyuta kursi o'rnatilmagan. Iltimos, birinchisini qo'shing.");
            } else {
                setError("Kurslarni yuklashda xatolik yuz berdi.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchLatestRate();
    }, [fetchLatestRate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.uzsToRub || !formState.rubToUzs) {
            setError("Iltimos, ikkala maydonni ham to'ldiring.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            await exchangeRateService.updateRate(formState);
            setSuccessMessage("Kurs muvaffaqiyatli yangilandi!");
            // Fetch the latest rate again to show the new "updated at" time
            fetchLatestRate();
            setTimeout(() => setSuccessMessage(''), 3000); // Hide message after 3 seconds
        } catch (err) {
            setError("Kursni yangilashda xatolik yuz berdi. Kiritilgan ma'lumotlarni tekshiring.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container currency-page">
            <div className="currency-panel">
                <h1>Valyuta Kurslari</h1>

                {rate && (
                    <div className="current-rates">
                        <div className="rate-display">
                            <span>1000 UZS</span>
                            <FiArrowRight />
                            <strong>{rate.uzsToRub} RUB</strong>
                        </div>
                        <div className="rate-display">
                            <span>1 RUB</span>
                            <FiArrowRight />
                            <strong>{rate.rubToUzs} UZS</strong>
                        </div>
                        <p className="update-info">
                            <FiClock />
                            So'nggi yangilanish: {format(new Date(rate.createdAt), "dd-MM-yyyy HH:mm")}
                        </p>
                    </div>
                )}

                <hr />

                <form onSubmit={handleSubmit} className="form">
                    <h3>Kursni Yangilash</h3>
                    <div className="form__group">
                        <label htmlFor="uzsToRub">1000 UZS uchun RUB miqdori</label>
                        <input
                            type="number"
                            step="any"
                            id="uzsToRub"
                            name="uzsToRub"
                            value={formState.uzsToRub}
                            onChange={handleInputChange}
                            placeholder="Masalan, 85.5"
                            required
                        />
                    </div>
                    <div className="form__group">
                        <label htmlFor="rubToUzs">1 RUB uchun UZS miqdori</label>
                        <input
                            type="number"
                            step="any"
                            id="rubToUzs"
                            name="rubToUzs"
                            value={formState.rubToUzs}
                            onChange={handleInputChange}
                            placeholder="Masalan, 147.5"
                            required
                        />
                    </div>

                    {error && <p className="form__error">{error}</p>}
                    {successMessage && <p className="form__success">{successMessage}</p>}

                    <Button type="submit" primary disabled={isSubmitting}>
                        {isSubmitting ? "Yangilanmoqda..." : "Saqlash"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CurrencyPage;