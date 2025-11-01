// src/components/PlatformForm.js

import React, { useState, useEffect } from 'react';
import { platformService } from '../api/platformService';
import { FiGrid, FiBox } from 'react-icons/fi'; // Import icons for the toggle

const PlatformForm = ({ platform, onSave, id, setFormIsSubmitting }) => {
    const [platformType, setPlatformType] = useState('common');

    const initialFormState = {
        name: '',
        currency: 'UZS',
        apiKey: '',
        login: '',
        password: '',
        workplaceId: '',
        secret: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState('');

    useEffect(() => {
        if (platform) {
            const type = platform.type || 'common';
            setPlatformType(type);

            setFormData({
                name: platform.name || '',
                currency: platform.currency || 'UZS',
                apiKey: platform.apiKey || '',
                login: platform.login || '',
                password: '',
                workplaceId: platform.workplaceId || '',
                secret: platform.secret || '',
            });
        } else {
            setPlatformType('common');
            setFormData(initialFormState);
        }
    }, [platform]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setPlatformType(newType);
        setError('');
        setFormData(prev => ({
            ...initialFormState,
            name: prev.name,
            currency: prev.currency,
            apiKey: prev.apiKey,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFormIsSubmitting(true);

        let payload = {
            type: platformType,
            name: formData.name,
            currency: formData.currency,
            apiKey: formData.apiKey,
        };
        let isValid = false;

        if (platformType === 'common') {
            if (!formData.name || !formData.apiKey || !formData.login || !formData.workplaceId) {
                setError('For "Common" type, please fill out Name, API Key, Login, and Workplace ID.');
            } else if (!platform && !formData.password) {
                setError('Password is required for new "Common" platforms.');
            } else {
                payload.login = formData.login;
                payload.workplaceId = formData.workplaceId;
                if (formData.password) payload.password = formData.password;
                isValid = true;
            }
        } else if (platformType === 'mostbet') {
            // --- MODIFIED: Added workplaceId to the validation check ---
            if (!formData.name || !formData.apiKey || !formData.secret || !formData.workplaceId) {
                setError('For "Mostbet" type, please fill out Name, API Key, Secret, and Workplace ID.');
            } else {
                payload.secret = formData.secret;
                // --- MODIFIED: Added workplaceId to the payload ---
                payload.workplaceId = formData.workplaceId;
                isValid = true;
            }
        }

        if (!isValid) {
            setFormIsSubmitting(false);
            return;
        }

        try {
            if (platform) {
                await platformService.updatePlatform(platform.id, payload);
            } else {
                await platformService.createPlatform(payload);
            }
            onSave();
        } catch (err) {
            setError('Failed to save platform. Please check the details and try again.');
            console.error(err);
        } finally {
            setFormIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form" id={id}>
            {error && <p className="form__error">{error}</p>}

            <div className="form__group form__group--toggle">
                <label>Platform Type</label>
                <div className="radio-toggle-group">
                    <input
                        type="radio"
                        id="type-common"
                        name="platformType"
                        value="common"
                        checked={platformType === 'common'}
                        onChange={handleTypeChange}
                    />
                    <label htmlFor="type-common" className="toggle-option">
                        <FiGrid /> Common
                    </label>
                    <input
                        type="radio"
                        id="type-mostbet"
                        name="platformType"
                        value="mostbet"
                        checked={platformType === 'mostbet'}
                        onChange={handleTypeChange}
                    />
                    <label htmlFor="type-mostbet" className="toggle-option">
                        <FiBox /> Mostbet
                    </label>
                </div>
            </div>

            <div className="form__grid">
                <div className="form__group">
                    <label htmlFor="name">Platform Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form__group">
                    <label htmlFor="currency">Currency</label>
                    <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
                        <option value="UZS">UZS</option>
                        <option value="RUB">RUB</option>
                    </select>
                </div>
            </div>
            <div className="form__group">
                <label htmlFor="apiKey">API Key</label>
                <input type="text" id="apiKey" name="apiKey" value={formData.apiKey} onChange={handleChange} required />
            </div>

            {platformType === 'common' && (
                <>
                    <div className="form__grid">
                        <div className="form__group">
                            <label htmlFor="login">Login</label>
                            <input type="text" id="login" name="login" value={formData.login} onChange={handleChange} />
                        </div>
                        <div className="form__group">
                            <label htmlFor="password">Password {platform ? '(Leave blank to keep current)' : ''}</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form__group">
                        <label htmlFor="workplaceId">Workplace ID</label>
                        <input type="text" id="workplaceId" name="workplaceId" value={formData.workplaceId} onChange={handleChange} />
                    </div>
                </>
            )}

            {platformType === 'mostbet' && (
                // --- MODIFIED: Wrapped in a React Fragment and added the Workplace ID field ---
                <>
                    <div className="form__group">
                        <label htmlFor="secret">Secret</label>
                        <input type="text" id="secret" name="secret" value={formData.secret} onChange={handleChange} />
                    </div>
                    <div className="form__group">
                        <label htmlFor="workplaceId">Workplace ID</label>
                        <input type="text" id="workplaceId" name="workplaceId" value={formData.workplaceId} onChange={handleChange} />
                    </div>
                </>
            )}
        </form>
    );
};

export default PlatformForm;