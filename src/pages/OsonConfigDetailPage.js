// src/pages/OsonConfigDetailPage.js
// src/pages/OsonConfigDetailPage.js
import React, { useState, useEffect } from 'react'; // Removed unused useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { osonConfigService } from '../api/osonConfigService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const OsonConfigDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [config, setConfig] = useState({ apiUrl: "https://core.oson.uz:8443/" });
    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [logString, setLogString] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        if (!isNew) {
            osonConfigService.getConfig(id)
                .then(response => setConfig(response.data))
                .catch(() => setError('Failed to load config data.'))
                .finally(() => setIsLoading(false));
        }
    }, [id, isNew]);

    // 👇 THIS IS THE CORRECTED FUNCTION
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const applyLogDataToForm = () => {
        if (!logString) return;
        const updates = {};
        logString.split('&').forEach(pair => {
            const parts = pair.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim().replace(/\s/g, ''); // Handle "device_ name" and other spaces
                const value = decodeURIComponent(parts[1].trim());
                if (key === 'phone') updates.phone = value;
                if (key === 'password') updates.password = value;
                if (key === 'dev_id') updates.deviceId = value;
                if (key === 'device_name') updates.deviceName = value;
            }
        });
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            if (isNew) {
                await osonConfigService.saveConfig(config);
            } else {
                await osonConfigService.updateConfig(id, config);
            }
            navigate('/oson-configs');
        } catch (err) {
            setError('Failed to save configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{isNew ? 'Create New' : 'Edit'} Oson Account</h1>
            </div>
            <div className="config-form-container">
                <div className="quick-paste-section">
                    <h3>Tez Kiritish (Quick Paste)</h3>
                    <div className="form__group">
                        <textarea value={logString} onChange={(e) => setLogString(e.target.value)} rows="4" />
                    </div>
                    <Button type="button" onClick={applyLogDataToForm}>Apply Data</Button>
                </div>

                {error && <p className="form__error">{error}</p>}

                <form onSubmit={handleSubmit} className="form">

                    <div className="form__group">
                        <label>Device Name</label>
                        <input type="text" name="deviceName" value={config.deviceName || ''} onChange={handleInputChange} required />
                    </div>

                    <div className="form__group">
                        <label>Phone</label>
                        <input type="text" name="phone" value={config.phone || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="form__group password-input-container">
                        <label>Password</label>
                        <input type={showPassword ? 'text' : 'password'} name="password" value={config.password || ''} onChange={handleInputChange} required />
                        <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    <div className="form__group">
                        <label>Device ID</label>
                        <input type="text" name="deviceId" value={config.deviceId || ''} onChange={handleInputChange} required />
                    </div>

                    <div className="form__actions">
                        <Button type="submit" primary disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        <Button type="button" onClick={() => navigate('/oson-configs')}>Cancel</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OsonConfigDetailPage;