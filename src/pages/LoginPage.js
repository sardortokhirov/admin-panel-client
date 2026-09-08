// src/pages/LoginPage.js

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(username, password);
        } catch (err) {
            setError('Foydalanuvchi nomi yoki parol xato. Qaytadan urining.');
            setIsSubmitting(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="login-page">
            <div className="login-form-container">
                <h2>Admin Panelga Kirish</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form__group">
                        <label htmlFor="username">Foydalanuvchi nomi</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form__group">
                        <label htmlFor="password">Parol</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="form__error">{error}</p>}
                    <Button type="submit" primary disabled={isSubmitting}>
                        {isSubmitting ? 'Tekshirilmoqda...' : 'Kirish'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;