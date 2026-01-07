// src/pages/OsonConfigsListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation
import { osonConfigService } from '../api/osonConfigService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FiEdit, FiTrash2, FiStar, FiPlusCircle } from 'react-icons/fi';

const OsonConfigsListPage = () => {
    const [configs, setConfigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchConfigs = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await osonConfigService.getAllConfigs();
            setConfigs(response.data);
        } catch (err) {
            setError('Failed to fetch Oson configurations.');
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
        fetchConfigs();
    }, [fetchConfigs]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this config?')) {
            try {
                await osonConfigService.deleteConfig(id);
                fetchConfigs();
            } catch (err) {
                alert(err.response?.data || 'Failed to delete. Ensure it is not primary.');
            }
        }
    };

    const handleSetPrimary = async (id) => {
        try {
            await osonConfigService.setPrimary(id);
            fetchConfigs(); // Refetch to show the new primary
        } catch (err) {
            setError('Failed to set primary config.');
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Oson Accounts</h1>
                {/* Link to the 'new' route for creation */}
                <Link to="/oson-configs/new">
                    <Button primary><FiPlusCircle /> Add New Account</Button>
                </Link>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="oson-config-grid">
                {configs.map(config => (
                    <div key={config.id} className={`oson-card ${config.primaryConfig ? 'primary' : ''}`}>
                        {config.primaryConfig && <div className="primary-badge"><FiStar /> PRIMARY</div>}
                        <div className="oson-card-header">
                            <h3>ID: {config.id}</h3>
                            <p>{config.deviceName}</p>
                        </div>
                        <div className="oson-card-body">
                            <p><strong>Phone:</strong> {config.phone}</p>
                        </div>
                        <div className="oson-card-actions">
                            {/* Link to the detail/edit page */}
                            <Link to={`/oson-configs/${config.id}`}>
                                <Button><FiEdit /> Edit</Button>
                            </Link>
                            {!config.primaryConfig && <Button onClick={() => handleSetPrimary(config.id)}><FiStar /> Set Primary</Button>}
                            <Button danger onClick={() => handleDelete(config.id)} disabled={config.primaryConfig}><FiTrash2 /> Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OsonConfigsListPage;