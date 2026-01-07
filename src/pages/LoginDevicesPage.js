// src/pages/LoginDevicesPage.js

import React, { useState, useEffect } from 'react';
import { loginService } from '../api/loginService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

// Import icons from react-icons
import {
    FiMonitor, FiSmartphone, FiTablet, FiGlobe, FiMapPin, FiClock, FiChevronDown, FiChevronUp, FiHelpCircle
} from 'react-icons/fi';

// Helper function to choose an icon and return a translated device name
const getDeviceIconAndName = (deviceName) => {
    // ... (this function is fine, no changes needed)
    const lowerDevice = deviceName.toLowerCase();
    if (lowerDevice.includes('windows')) {
        return { icon: <FiMonitor />, name: 'Windows Kompyuter' };
    }
    if (lowerDevice.includes('mac')) {
        return { icon: <FiMonitor />, name: 'Mac' };
    }
    if (lowerDevice.includes('linux')) {
        return { icon: <FiMonitor />, name: 'Linux Kompyuter' };
    }
    if (lowerDevice.includes('iphone')) {
        return { icon: <FiSmartphone />, name: 'iPhone' };
    }
    if (lowerDevice.includes('ipad')) {
        return { icon: <FiTablet />, name: 'iPad' };
    }
    if (lowerDevice.includes('android')) {
        return { icon: <FiSmartphone />, name: 'Android Qurilma' };
    }
    return { icon: <FiHelpCircle />, name: 'Noma\'lum Qurilma' };
};


const LoginDevicesPage = () => {
    const [loginEvents, setLoginEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        const fetchLoginEvents = async () => {
            try {
                const response = await loginService.getLoginEvents();
                // We will sort after ensuring the date is parsed correctly
                const eventsWithCorrectedTime = response.data.map(event => ({
                    ...event,
                    // The backend sends a string like "2023-10-27T14:00:00". We add 'Z'
                    // to tell JavaScript "This is a UTC time, not a local time".
                    loginTime: event.loginTime + 'Z'
                }));
                const sortedEvents = eventsWithCorrectedTime.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
                setLoginEvents(sortedEvents);
            } catch (err) {
                setError('Kirishlar tarixini yuklashda xatolik.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLoginEvents();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page-container login-devices-page">
            <div className="page-header">
                <h1>Kirishlar Tarixi</h1>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loginEvents.length > 0 ? (
                <div className="login-history-grid">
                    {loginEvents.map(event => {
                        const { icon, name } = getDeviceIconAndName(event.deviceName);

                        // We create the Date object here from the already corrected time string
                        const loginTimeUTC = new Date(event.loginTime);

                        return (
                            <div key={event.id} className="login-card">
                                <div className="login-card__header">
                                    <span className="login-card__icon">{icon}</span>
                                    <div className="login-card__title">
                                        <h3>{name}</h3>
                                        <small>{event.username}</small>
                                    </div>
                                </div>
                                <ul className="login-card__body">
                                    <li>
                                        <FiMapPin /> <span>{event.city || 'Noma\'lum Shahar'}, {event.country || 'Noma\'lum Davlat'}</span>
                                    </li>
                                    <li>
                                        <FiGlobe /> <span>{event.ipAddress}</span>
                                    </li>
                                    <li>
                                        <FiClock />
                                        {/* 👇 NOW THIS WILL WORK CORRECTLY */}
                                        <span>{formatDistanceToNow(loginTimeUTC, { addSuffix: true, locale: uz })}</span>
                                    </li>
                                </ul>
                                <div className="login-card__footer">
                                    <button className="details-toggle" onClick={() => toggleExpand(event.id)}>
                                        <span>Batafsil</span>
                                        {expandedId === event.id ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                    {expandedId === event.id && (
                                        <div className="login-card__details-content">
                                            <p>{event.userAgent}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="no-data-card">
                    <FiHelpCircle size={40} />
                    <p>Hozircha kirish qaydlari mavjud emas.</p>
                </div>
            )}
        </div>
    );
};

export default LoginDevicesPage;