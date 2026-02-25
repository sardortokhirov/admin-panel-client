// src/pages/ApkLinkBotPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { apkLinkBotService } from '../api/apkLinkBotService';
import { setAuthHeader } from '../api/apiService';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import {
    FiSettings, FiGrid, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiTag, FiFile, FiLink, FiLayers,
    FiRefreshCw, FiEye, FiEyeOff, FiInfo, FiHelpCircle, FiFileText, FiHash, FiUsers, FiTv, FiChevronRight, FiCheckCircle, FiShare2, FiMessageCircle
} from 'react-icons/fi';

const ApkLinkBotPage = () => {
    // --- State ---
    const [config, setConfig] = useState(null);
    const [platforms, setPlatforms] = useState([]);
    const [channels, setChannels] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showToken, setShowToken] = useState(false);

    // Config Edit State
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [configFormData, setConfigFormData] = useState({
        botToken: '',
        cooldownPrivateMinutes: '',
        cooldownGroupMinutes: '',
        channelKeywordAllApk: '',
        groupKeywordAllApk: '',
        autoPostIntervalHours: '',
        groupUserLinkLimit: '',
        groupUserApkLimit: '',
        groupUserFreezeMinutes: ''
    });

    // Main Channel State
    const [mainChannelIdInput, setMainChannelIdInput] = useState('');
    const [isSavingMainChannel, setIsSavingMainChannel] = useState(false);

    // Platform Modal State
    const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [platformFormData, setPlatformFormData] = useState({
        name: '', linkUrl: '', apkFileId: '', apkUrl: '', apkFileName: '', sortOrder: 0, apkCaption: '',
        linkKeyword: '', apkKeyword: ''
    });
    const [isPlatformSubmitting, setIsPlatformSubmitting] = useState(false);

    // Channel/Group Modal State
    const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
    const [entityType, setEntityType] = useState('CHANNEL'); // 'CHANNEL' or 'GROUP'
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [entityFormData, setEntityFormData] = useState({
        name: '', inviteLink: '', sortOrder: 0
    });
    const [isEntitySubmitting, setIsEntitySubmitting] = useState(false);

    // Keywords Tag Modal State
    const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
    const [activePlatformForKeywords, setActivePlatformForKeywords] = useState(null);
    const [localLinkKeywords, setLocalLinkKeywords] = useState([]);
    const [localApkKeywords, setLocalApkKeywords] = useState([]);
    const [newLinkKw, setNewLinkKw] = useState('');
    const [newApkKw, setNewApkKw] = useState('');
    const [isSavingKeywords, setIsSavingKeywords] = useState(false);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [configRes, platformsRes, channelsRes, groupsRes] = await Promise.all([
                apkLinkBotService.getConfig(),
                apkLinkBotService.getPlatforms(),
                apkLinkBotService.getChannels(),
                apkLinkBotService.getGroups()
            ]);
            setConfig(configRes.data);
            setMainChannelIdInput(configRes.data.mainApkChannelChatId || '');
            setPlatforms(platformsRes.data);
            setChannels(channelsRes.data);
            setGroups(groupsRes.data);
            setError('');
        } catch (err) {
            setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
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
        fetchData();
    }, [fetchData]);

    // --- Config Handlers ---
    const handleEditConfig = () => {
        setIsEditingConfig(true);
        setConfigFormData({
            botToken: '',
            cooldownPrivateMinutes: config?.cooldownPrivateMinutes || '',
            cooldownGroupMinutes: config?.cooldownGroupMinutes || '',
            channelKeywordAllApk: config?.channelKeywordAllApk || '',
            groupKeywordAllApk: config?.groupKeywordAllApk || '',
            autoPostIntervalHours: config?.autoPostIntervalHours || '',
            groupUserLinkLimit: config?.groupUserLinkLimit || '',
            groupUserApkLimit: config?.groupUserApkLimit || '',
            groupUserFreezeMinutes: config?.groupUserFreezeMinutes || ''
        });
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfigFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...configFormData };
            if (!payload.botToken) delete payload.botToken;
            const response = await apkLinkBotService.updateConfig(payload);
            setConfig(response.data);
            setIsEditingConfig(false);
            setSuccess('Bot sozlamalari yangilandi');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Xatolik yuz berdi';
            setError(msg);
        }
    };

    const handleSaveMainChannel = async () => {
        setIsSavingMainChannel(true);
        setError('');
        try {
            const val = mainChannelIdInput === '' ? null : mainChannelIdInput;
            const response = await apkLinkBotService.updateMainChannel({ mainApkChannelChatId: val });
            setConfig(response.data);
            setMainChannelIdInput(response.data.mainApkChannelChatId || '');
            setSuccess('Asosiy kanal muvaffaqiyatli saqlandi');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Xatolik yuz berdi';
            setError(msg);
        } finally {
            setIsSavingMainChannel(false);
        }
    };

    // --- Platform Handlers ---
    const handleOpenPlatformModal = (platform = null) => {
        setSelectedPlatform(platform);
        setPlatformFormData({
            name: platform?.name || '',
            linkUrl: platform?.linkUrl || '',
            apkFileId: platform?.apkFileId || '',
            apkUrl: platform?.apkUrl || '',
            apkFileName: platform?.apkFileName || '',
            apkCaption: platform?.apkCaption || '',
            linkKeyword: platform?.linkKeyword || '',
            apkKeyword: platform?.apkKeyword || '',
            sortOrder: platform?.sortOrder || 0
        });
        setIsPlatformModalOpen(true);
    };

    const handlePlatformChange = (e) => {
        const { name, value } = e.target;
        setPlatformFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSavePlatform = async (e) => {
        e.preventDefault();
        setIsPlatformSubmitting(true);
        try {
            if (selectedPlatform) await apkLinkBotService.updatePlatform(selectedPlatform.id, platformFormData);
            else await apkLinkBotService.createPlatform(platformFormData);
            await fetchData();
            setIsPlatformModalOpen(false);
            setSuccess('Platforma saqlandi');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) { setError('Saqlashda xatolik'); }
        finally { setIsPlatformSubmitting(false); }
    };

    const handleDeletePlatform = async (id) => {
        if (!window.confirm('Haqiqatan ham o\'chirib tashlamoqchimisiz?')) return;
        try { await apkLinkBotService.deletePlatform(id); await fetchData(); }
        catch (err) { setError('O\'chirishda xatolik'); }
    };

    // --- Channel/Group Handlers ---
    const handleOpenEntityModal = (type, entity = null) => {
        setEntityType(type);
        setSelectedEntity(entity);
        setEntityFormData({
            name: entity?.name || '', inviteLink: entity?.inviteLink || '', sortOrder: entity?.sortOrder || 0
        });
        setIsEntityModalOpen(true);
    };

    const handleEntityChange = (e) => {
        const { name, value } = e.target;
        setEntityFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEntity = async (e) => {
        e.preventDefault();
        setIsEntitySubmitting(true);
        try {
            if (entityType === 'CHANNEL') {
                if (selectedEntity) await apkLinkBotService.updateChannel(selectedEntity.id, entityFormData);
                else await apkLinkBotService.createChannel(entityFormData);
            } else {
                if (selectedEntity) await apkLinkBotService.updateGroup(selectedEntity.id, entityFormData);
                else await apkLinkBotService.createGroup(entityFormData);
            }
            await fetchData();
            setIsEntityModalOpen(false);
            setSuccess(entityType === 'CHANNEL' ? 'Kanal saqlandi' : 'Guruh saqlandi');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) { setError('Saqlashda xatolik'); }
        finally { setIsEntitySubmitting(false); }
    };

    const handleDeleteEntity = async (type, id) => {
        if (!window.confirm('Haqiqatan ham o\'chirib tashlamoqchimisiz?')) return;
        try {
            if (type === 'CHANNEL') await apkLinkBotService.deleteChannel(id);
            else await apkLinkBotService.deleteGroup(id);
            await fetchData();
        } catch (err) { setError('O\'chirishda xatolik'); }
    };

    // --- Keywords Modal Handlers ---
    const handleOpenKeywordsModal = (platform) => {
        setActivePlatformForKeywords(platform);
        setLocalLinkKeywords(platform.linkKeyword ? platform.linkKeyword.split(',').map(k => k.trim()).filter(Boolean) : []);
        setLocalApkKeywords(platform.apkKeyword ? platform.apkKeyword.split(',').map(k => k.trim()).filter(Boolean) : []);
        setNewLinkKw('');
        setNewApkKw('');
        setIsKeywordsModalOpen(true);
    };

    const handleAddLocalKeyword = (e, type) => {
        e.preventDefault();
        if (type === 'link') {
            if (!newLinkKw.trim()) return;
            setLocalLinkKeywords([...localLinkKeywords, newLinkKw.trim()]);
            setNewLinkKw('');
        } else {
            if (!newApkKw.trim()) return;
            setLocalApkKeywords([...localApkKeywords, newApkKw.trim()]);
            setNewApkKw('');
        }
    };

    const handleRemoveLocalKeyword = (index, type) => {
        if (type === 'link') {
            setLocalLinkKeywords(localLinkKeywords.filter((_, i) => i !== index));
        } else {
            setLocalApkKeywords(localApkKeywords.filter((_, i) => i !== index));
        }
    };

    const handleSaveKeywordsModal = async () => {
        setIsSavingKeywords(true);
        try {
            const updatedPlatform = {
                ...activePlatformForKeywords,
                linkKeyword: localLinkKeywords.join(', '),
                apkKeyword: localApkKeywords.join(', ')
            };
            await apkLinkBotService.updatePlatform(activePlatformForKeywords.id, updatedPlatform);
            await fetchData();
            setIsKeywordsModalOpen(false);
            setSuccess('Kalit so\'zlar muvaffaqiyatli saqlandi');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Saqlashda xatolik yuz berdi');
        } finally {
            setIsSavingKeywords(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="page-container apk-bot-page">
            <header className="page-header custom-header">
                <div className="header-info">
                    <h1>Apk Link Bot <span className="status-indicator">Active</span></h1>
                    <p>Bot ekotizimini va tarqatish kanallarini boshqarish markazi.</p>
                </div>
                <div className="header-actions">
                    <Button primary onClick={() => handleOpenPlatformModal()}>
                        <FiPlus /> Yangi Platforma
                    </Button>
                </div>
            </header>

            {error && <div className="form__error floating-error">{error}</div>}
            {success && <div className="form__success floating-success">{success}</div>}

            <div className="apk-bot-content">
                {/* Bot Configuration */}
                <section className="config-section-premium">
                    <div className="section-header-inline">
                        <div className="title-with-icon"><FiSettings /> <span>Bot Sozlamalari</span></div>
                        {!isEditingConfig && <Button outline small onClick={handleEditConfig}><FiEdit /> Tahrirlash</Button>}
                    </div>

                    <div className="config-card">
                        {isEditingConfig ? (
                            <form onSubmit={handleSaveConfig} className="premium-form-layout">
                                <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '1.5rem' }}>
                                    <FiInfo /> Eslatma: Bot tokenini o'zgartirish dasturni qayta ishga tushirishni talab qiladi.
                                </p>
                                <div className="form-grid-three">
                                    <div className="input-field">
                                        <label>Bot Token</label>
                                        <input type="password" name="botToken" value={configFormData.botToken} onChange={handleConfigChange} placeholder="Tokenni maskasiz kiriting..." />
                                    </div>
                                    <div className="input-field">
                                        <label>Private Cooldown (min)</label>
                                        <input type="number" name="cooldownPrivateMinutes" value={configFormData.cooldownPrivateMinutes} onChange={handleConfigChange} required />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Shaxsiy xabarlarda so'rovlar oralig'i (daqiqa)</small>
                                    </div>
                                    <div className="input-field">
                                        <label>Group Cooldown (min)</label>
                                        <input type="number" name="cooldownGroupMinutes" value={configFormData.cooldownGroupMinutes} onChange={handleConfigChange} required />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Guruhlarda umumiy so'rovlar oralig'i (daqiqa)</small>
                                    </div>
                                </div>
                                <div className="form-grid-two">
                                    <div className="input-field">
                                        <label>Channel Keyword (barcha APKlar)</label>
                                        <input type="text" name="channelKeywordAllApk" value={configFormData.channelKeywordAllApk} onChange={handleConfigChange} placeholder="Masalan: /apk" />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Asosiy kanalda barcha APKlarni tashlash komandasi</small>
                                    </div>
                                    <div className="input-field">
                                        <label>Group Keyword (APK link)</label>
                                        <input type="text" name="groupKeywordAllApk" value={configFormData.groupKeywordAllApk} onChange={handleConfigChange} placeholder="Masalan: !apk" />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Guruhlarda APK/Link so'rash maxsus so'zi</small>
                                    </div>
                                    <div className="input-field">
                                        <label>Auto-Post Intervali (soatlarda)</label>
                                        <input type="number" name="autoPostIntervalHours" value={configFormData.autoPostIntervalHours} onChange={handleConfigChange} placeholder="Masalan: 3" />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Bot har N soatda barcha guruhlarga APK tashlaydi (0 = o'chirilgan)</small>
                                    </div>
                                    <div className="input-field">
                                        <label>Max Link Requests per User</label>
                                        <input type="number" name="groupUserLinkLimit" value={configFormData.groupUserLinkLimit} onChange={handleConfigChange} placeholder="Masalan: 3" />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Bitta user guruhda necha marta Link so'rashi mumkin</small>
                                    </div>
                                    <div className="input-field">
                                        <label>Max APK Requests per User</label>
                                        <input type="number" name="groupUserApkLimit" value={configFormData.groupUserApkLimit} onChange={handleConfigChange} placeholder="Masalan: 2" />
                                        <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Bitta user guruhda necha marta APK so'rashi mumkin</small>
                                    </div>
                                    <div className="input-field">
                                        <label>Mute/Freeze Duration (Minutes)</label>
                                        <input type="number" name="groupUserFreezeMinutes" value={configFormData.groupUserFreezeMinutes} onChange={handleConfigChange} placeholder="Masalan: 10" />
                                        <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Limitdan oshgan userni guruhda shuncha daqiqa yozishdan cheklaydi</small>
                                    </div>
                                </div>
                                <div className="form-actions-right">
                                    <Button type="button" onClick={() => setIsEditingConfig(false)}><FiX /> Bekor qilish</Button>
                                    <Button primary type="submit"><FiSave /> Saqlash</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="config-display">
                                <div className="display-row">
                                    <div className="display-item token-item">
                                        <label>Bot Token</label>
                                        <div className="token-box">
                                            <span>{showToken ? config?.botTokenMasked : "••••••••••••••••"}</span>
                                            <button onClick={() => setShowToken(!showToken)}>{showToken ? <FiEyeOff /> : <FiEye />}</button>
                                        </div>
                                    </div>
                                    <div className="display-item">
                                        <label>Private / Group Cooldown</label>
                                        <div className="value-pills">
                                            <span className="pill">{config?.cooldownPrivateMinutes}m</span>
                                            <span className="pill">{config?.cooldownGroupMinutes}m</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="display-row secondary-row">
                                    <div className="display-item">
                                        <label>Kanal Kalit So'zi</label>
                                        <div className="keyword-text">{config?.channelKeywordAllApk || '—'}</div>
                                    </div>
                                    <div className="display-item">
                                        <label>Guruh Kalit So'zi</label>
                                        <div className="keyword-text">{config?.groupKeywordAllApk || '—'}</div>
                                    </div>
                                    <div className="display-item">
                                        <label>Auto-Post Intervali (soat)</label>
                                        <div className="keyword-text">{config?.autoPostIntervalHours || 'O\'chirilgan (0)'}</div>
                                    </div>
                                </div>
                                <div className="display-row secondary-row">
                                    <div className="display-item">
                                        <label>Guruh User Limit (Link / APK)</label>
                                        <div className="value-pills">
                                            <span className="pill" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>{config?.groupUserLinkLimit || '—'} marta</span>
                                            <span className="pill" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>{config?.groupUserApkLimit || '—'} marta</span>
                                        </div>
                                    </div>
                                    <div className="display-item">
                                        <label>Mute / Freeze Jazosi</label>
                                        <div className="keyword-text" style={{ color: '#ef4444' }}>{config?.groupUserFreezeMinutes || '0'} daqiqa</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                                    <FiInfo /> Bot tokenini o'zgartirish dasturni qayta ishga tushirishni talab qiladi.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Main Channel for APK Section */}
                <section className="config-section-premium" style={{ marginTop: '-2rem' }}>
                    <div className="section-header-inline">
                        <div className="title-with-icon"><FiTv /> <span>APK uchun Asosiy Kanal</span></div>
                    </div>
                    <div className="config-card">
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            <FiInfo /> Faqat ushbu kanal kanal kalit so'zi yuborilganda 'barcha APKlarni yuborish'ni ishga tushirishi mumkin.
                            Shaxsiy xabarlarda APK tugmasini bosgan foydalanuvchilar quyidagi havolaga yo'naltiriladi.
                        </p>

                        <div className="premium-form-layout">
                            <div className="form-grid-two">
                                <div className="input-field">
                                    <label>Asosiy Kanal Chat ID</label>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <input
                                            type="text"
                                            value={mainChannelIdInput}
                                            onChange={(e) => setMainChannelIdInput(e.target.value)}
                                            placeholder="-1001234567890 (Ixtiyoriy)"
                                            style={{ flex: 1 }}
                                        />
                                        <Button primary onClick={handleSaveMainChannel} disabled={isSavingMainChannel}>
                                            {isSavingMainChannel ? <FiRefreshCw className="spin" /> : <FiSave />} Saqlash
                                        </Button>
                                    </div>
                                    <small style={{ display: 'block', marginTop: '0.5rem', color: '#64748b' }}>
                                        Bo'sh qoldirib saqlansa, kanal kalit so'zi yuborilgan birinchi kanal avtomatik ravishda asosiyga aylanadi.
                                    </small>
                                </div>
                                <div className="display-item">
                                    <label>Asosiy APK Kanal Havolasi</label>
                                    {config?.apkChannelMessageLink ? (
                                        <a href={config.apkChannelMessageLink} target="_blank" rel="noreferrer" className="link-badge" style={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>
                                            <FiLink /> {config.apkChannelMessageLink}
                                        </a>
                                    ) : (
                                        <div className="keyword-text" style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px' }}>
                                            Hali o'rnatilmagan (generatsiya qilish uchun kanal kalit so'zini asosoiy kanalda yuboring)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Connection Hub (Channels & Groups) */}
                <div className="connection-hub">
                    <div className="hub-column">
                        <div className="hub-header">
                            <div className="hub-title"><FiTv /> <span>Invite Kanallar</span></div>
                            <button className="add-mini-btn" onClick={() => handleOpenEntityModal('CHANNEL')}><FiPlus /></button>
                        </div>
                        <div className="hub-list">
                            {channels.sort((a, b) => a.sortOrder - b.sortOrder).map(ch => (
                                <div key={ch.id} className="hub-card">
                                    <div className="hub-card-top">
                                        <div className="name-wrap">
                                            <span className="order-dot">{ch.sortOrder}</span>
                                            <h4>{ch.name}</h4>
                                        </div>
                                        <div className="actions">
                                            <button onClick={() => handleOpenEntityModal('CHANNEL', ch)}><FiEdit /></button>
                                            <button className="delete" onClick={() => handleDeleteEntity('CHANNEL', ch.id)}><FiTrash2 /></button>
                                        </div>
                                    </div>
                                    <a href={ch.inviteLink} target="_blank" rel="noreferrer" className="hub-link">{ch.inviteLink}</a>
                                </div>
                            ))}
                            {channels.length === 0 && <div className="empty-hub">Kanal yo'q</div>}
                        </div>
                    </div>

                    <div className="hub-column">
                        <div className="hub-header">
                            <div className="hub-title"><FiUsers /> <span>Invite Guruhlar</span></div>
                            <button className="add-mini-btn" onClick={() => handleOpenEntityModal('GROUP')}><FiPlus /></button>
                        </div>
                        <div className="hub-list">
                            {groups.sort((a, b) => a.sortOrder - b.sortOrder).map(gr => (
                                <div key={gr.id} className="hub-card">
                                    <div className="hub-card-top">
                                        <div className="name-wrap">
                                            <span className="order-dot">{gr.sortOrder}</span>
                                            <h4>{gr.name}</h4>
                                        </div>
                                        <div className="actions">
                                            <button onClick={() => handleOpenEntityModal('GROUP', gr)}><FiEdit /></button>
                                            <button className="delete" onClick={() => handleDeleteEntity('GROUP', gr.id)}><FiTrash2 /></button>
                                        </div>
                                    </div>
                                    <a href={gr.inviteLink} target="_blank" rel="noreferrer" className="hub-link">{gr.inviteLink}</a>
                                </div>
                            ))}
                            {groups.length === 0 && <div className="empty-hub">Guruh yo'q</div>}
                        </div>
                    </div>
                </div>

                {/* Platforms List */}
                <section className="platforms-container-premium">
                    <div className="section-header-inline padd-x">
                        <div className="title-with-icon"><FiLayers /> <span>Platformalar</span></div>
                        <span className="platform-count">{platforms.length} ta mavjud</span>
                    </div>

                    <div className="premium-card-grid">
                        {platforms.sort((a, b) => a.sortOrder - b.sortOrder).map(platform => (
                            <div key={platform.id} className="platform-card-premium">
                                <div className="card-accent-bar"></div>
                                <div className="card-top">
                                    <div className="platform-name-area">
                                        <div className="icon-wrap"><FiGrid /></div>
                                        <div className="name-stack">
                                            <h3>{platform.name}</h3>
                                            <span className="order-label">Tartib: #{platform.sortOrder}</span>
                                        </div>
                                    </div>
                                    <div className="card-options">
                                        <button onClick={() => handleOpenPlatformModal(platform)} title="Tahrirlash"><FiEdit /></button>
                                        <button className="delete" onClick={() => handleDeletePlatform(platform.id)} title="O'chirish"><FiTrash2 /></button>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <FiLink /> <a href={platform.linkUrl} target="_blank" rel="noreferrer">{platform.linkUrl}</a>
                                    </div>
                                    <div className="info-row secondary">
                                        <FiFile /> <span>File ID: {platform.apkFileId || '—'}</span>
                                    </div>
                                    {platform.apkFileName && (
                                        <div className="info-row secondary">
                                            <FiFileText /> <span>Display: {platform.apkFileName}</span>
                                        </div>
                                    )}
                                    {platform.linkKeyword && (
                                        <div className="info-row secondary" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <FiTag /> <span style={{ marginRight: '0.2rem', flexShrink: 0 }}>Link Keywords:</span>
                                            {platform.linkKeyword.split(',').map((kw, i) => kw.trim() ? (
                                                <span key={i} style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                                    {kw.trim()}
                                                </span>
                                            ) : null)}
                                        </div>
                                    )}
                                    {platform.apkKeyword && (
                                        <div className="info-row secondary" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <FiTag /> <span style={{ marginRight: '0.2rem', flexShrink: 0 }}>APK Keywords:</span>
                                            {platform.apkKeyword.split(',').map((kw, i) => kw.trim() ? (
                                                <span key={i} style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                                    {kw.trim()}
                                                </span>
                                            ) : null)}
                                        </div>
                                    )}
                                    {platform.apkCaption && (
                                        <div className="info-row secondary" style={{ alignItems: 'flex-start' }}>
                                            <FiMessageCircle style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Caption: {platform.apkCaption}</span>
                                        </div>
                                    )}
                                    <div className="info-row secondary" style={{ opacity: platform.apkUrl ? 1 : 0.4 }}>
                                        <FiShare2 /> <span>Mirror: {platform.apkUrl ? 'Mavjud' : 'Yo\'q'}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <button className="keywords-trigger" onClick={() => handleOpenKeywordsModal(platform)}>
                                        <FiTag /> Kalit so'zlar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Entity Modal */}
            <Modal
                isOpen={isEntityModalOpen}
                onClose={() => setIsEntityModalOpen(false)}
                title={selectedEntity ? 'Tahrirlash' : 'Yangi qo\'shish'}
                renderFooter={() => (
                    <div className="modal-footer-custom">
                        <Button onClick={() => setIsEntityModalOpen(false)}>Bekor qilish</Button>
                        <Button primary type="submit" form="entity-form" disabled={isEntitySubmitting}>
                            {isEntitySubmitting ? <FiRefreshCw className="spin" /> : <FiSave />} Saqlash
                        </Button>
                    </div>
                )}
            >
                <form id="entity-form" onSubmit={handleSaveEntity} className="modal-premium-form">
                    <div className="modal-field"><label>Nomi</label><input name="name" value={entityFormData.name} onChange={handleEntityChange} required /></div>
                    <div className="modal-field"><label>Taklif linki (t.me/...)</label><input name="inviteLink" value={entityFormData.inviteLink} onChange={handleEntityChange} required /></div>
                    <div className="modal-field"><label>Tartibi (Sort Order)</label><input type="number" name="sortOrder" value={entityFormData.sortOrder} onChange={handleEntityChange} /></div>
                </form>
            </Modal>

            {/* Platform Modal */}
            <Modal
                isOpen={isPlatformModalOpen}
                onClose={() => setIsPlatformModalOpen(false)}
                title={selectedPlatform ? 'Platformani tahrirlash' : 'Yangi platforma'}
                renderFooter={() => (
                    <div className="modal-footer-custom">
                        <Button onClick={() => setIsPlatformModalOpen(false)}>Bekor qilish</Button>
                        <Button primary type="submit" form="platform-form" disabled={isPlatformSubmitting}>
                            {isPlatformSubmitting ? <FiRefreshCw className="spin" /> : <FiSave />} Saqlash
                        </Button>
                    </div>
                )}
            >
                <form id="platform-form" onSubmit={handleSavePlatform} className="modal-premium-form">
                    <div className="modal-row-two">
                        <div className="modal-field"><label>Platforma Nomi</label><input name="name" value={platformFormData.name} onChange={handlePlatformChange} required /></div>
                        <div className="modal-field"><label>Sort Order</label><input type="number" name="sortOrder" value={platformFormData.sortOrder} onChange={handlePlatformChange} /></div>
                    </div>
                    <div className="modal-field"><label>Asosiy Web Link</label><input name="linkUrl" value={platformFormData.linkUrl} onChange={handlePlatformChange} required /></div>
                    <div className="modal-row-two">
                        <div className="modal-field">
                            <label>Telegram File ID</label>
                            <input name="apkFileId" value={platformFormData.apkFileId} onChange={handlePlatformChange} placeholder="file_id_xxxxx..." />
                        </div>
                        <div className="modal-field">
                            <label>APK Display Name</label>
                            <input name="apkFileName" value={platformFormData.apkFileName} onChange={handlePlatformChange} placeholder="app_name.apk" />
                        </div>
                    </div>
                    <div className="modal-field">
                        <label>Muqobil (Mirror) APK URL</label>
                        <input name="apkUrl" value={platformFormData.apkUrl} onChange={handlePlatformChange} placeholder="https://..." />
                    </div>
                    <div className="modal-field">
                        <label>APK Caption (Text/Message)</label>
                        <textarea
                            name="apkCaption"
                            value={platformFormData.apkCaption}
                            onChange={handlePlatformChange}
                            placeholder="🎁 Ilovamizni yuklab oling va bonusga ega bo'ling!"
                            rows="4"
                            maxLength="2000"
                        ></textarea>
                    </div>
                </form>
            </Modal>

            {/* Platform Keywords Tagging Modal */}
            <Modal
                isOpen={isKeywordsModalOpen}
                onClose={() => setIsKeywordsModalOpen(false)}
                title={<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiTag /> <span>{activePlatformForKeywords?.name} - Kalit So'zlar</span></div>}
                renderFooter={() => (
                    <div className="modal-footer-custom">
                        <Button onClick={() => setIsKeywordsModalOpen(false)}>Bekor qilish</Button>
                        <Button primary onClick={handleSaveKeywordsModal} disabled={isSavingKeywords}>
                            {isSavingKeywords ? <FiRefreshCw className="spin" /> : <FiSave />} Saqlash
                        </Button>
                    </div>
                )}
            >
                <div className="keywords-management-area">
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                        Bu yerdan har bir toifa uchun bir nechta kalit so'zlarni qulay qo'shishingiz va o'chirishingiz mumkin.
                    </p>

                    {/* Link Keywords */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#60a5fa' }}>Link Kalit So'zlari (Reference Link uchun)</div>
                        <form onSubmit={(e) => handleAddLocalKeyword(e, 'link')} className="keyword-add-premium">
                            <input type="text" placeholder="Yangi so'z (masalan: 1xbet-link)..." value={newLinkKw} onChange={(e) => setNewLinkKw(e.target.value)} autoComplete="off" />
                            <button type="submit"><FiPlus /></button>
                        </form>
                        <div className="keyword-grid-premium">
                            {localLinkKeywords.map((kw, i) => (
                                <div key={i} className="keyword-tag-premium" style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                                    <span>{kw}</span>
                                    <FiX className="del" onClick={() => handleRemoveLocalKeyword(i, 'link')} />
                                </div>
                            ))}
                            {localLinkKeywords.length === 0 && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Hozircha qo'shilmagan</span>}
                        </div>
                    </div>

                    {/* APK Keywords */}
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>APK Kalit So'zlari (APK fayllar uchun)</div>
                        <form onSubmit={(e) => handleAddLocalKeyword(e, 'apk')} className="keyword-add-premium">
                            <input type="text" placeholder="Yangi so'z (masalan: 1xbet-apk)..." value={newApkKw} onChange={(e) => setNewApkKw(e.target.value)} autoComplete="off" />
                            <button type="submit"><FiPlus /></button>
                        </form>
                        <div className="keyword-grid-premium">
                            {localApkKeywords.map((kw, i) => (
                                <div key={i} className="keyword-tag-premium" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                                    <span>{kw}</span>
                                    <FiX className="del" onClick={() => handleRemoveLocalKeyword(i, 'apk')} />
                                </div>
                            ))}
                            {localApkKeywords.length === 0 && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Hozircha qo'shilmagan</span>}
                        </div>
                    </div>
                </div>
            </Modal>


        </div>
    );
};

export default ApkLinkBotPage;
