import React, { useEffect, useState } from 'react';
import { promoService } from '../../api/promoService';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { FiX, FiTrash2 } from 'react-icons/fi';

const PromoChatDetailModal = ({ chatId, onClose, onLinksChanged }) => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [platformUserId, setPlatformUserId] = useState('');
    const [platformName, setPlatformName] = useState('');

    const loadLinks = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await promoService.getChatLinks(chatId);
            setLinks(res.data || []);
        } catch (err) {
            console.error(err);
            setError('Bog\'lanishlarni yuklab bo\'lmadi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatId) loadLinks();
    }, [chatId]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!platformUserId.trim() || !platformName.trim()) {
            setError('Kontora nomi va platforma ID kiriting.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await promoService.addChatLink(chatId, {
                platformUserId: platformUserId.trim(),
                platformName: platformName.trim(),
            });
            setPlatformUserId('');
            setPlatformName('');
            await loadLinks();
            onLinksChanged?.();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Qo\'shishda xatolik.';
            setError(typeof msg === 'string' ? msg : 'Qo\'shishda xatolik.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (linkId) => {
        if (!window.confirm('Ushbu bog\'lanishni o\'chirasizmi?')) return;
        try {
            await promoService.deleteChatLink(chatId, linkId);
            await loadLinks();
            onLinksChanged?.();
        } catch (err) {
            alert('O\'chirishda xatolik.');
        }
    };

    return (
        <div className="promo-modal-overlay" onClick={onClose}>
            <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
                <div className="promo-modal-header">
                    <h2>Chat ID: {chatId}</h2>
                    <button type="button" className="promo-modal-close" onClick={onClose} aria-label="Yopish">
                        <FiX />
                    </button>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {links.length === 0 ? (
                            <p className="promo-modal-empty">Hali platforma bog'lanmagan.</p>
                        ) : (
                            <table className="promo-modal-table">
                                <thead>
                                    <tr>
                                        <th>Kontora nomi</th>
                                        <th>Platforma ID</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {links.map((link) => (
                                        <tr key={link.id}>
                                            <td>{link.platformName}</td>
                                            <td className="mono">{link.platformUserId}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(link.id)}
                                                    title="O'chirish"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <form className="promo-modal-form" onSubmit={handleAdd}>
                            <h3>Platforma qo'shish</h3>
                            <div className="promo-modal-form-row">
                                <input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Kontora nomi (masalan: 1xbet)"
                                    maxLength={80}
                                    value={platformName}
                                    onChange={(e) => setPlatformName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Platforma foydalanuvchi ID"
                                    value={platformUserId}
                                    onChange={(e) => setPlatformUserId(e.target.value)}
                                />
                                <Button primary type="submit" disabled={saving}>
                                    {saving ? '...' : 'Qo\'shish'}
                                </Button>
                            </div>
                        </form>

                        {error && <div className="error-message">{error}</div>}
                    </>
                )}
            </div>

            <style jsx="true">{`
                .promo-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.65);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .promo-modal {
                    background: #16213e;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    max-width: 640px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 1.5rem;
                    color: #fff;
                }
                .promo-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 1rem;
                }
                .promo-modal-header h2 {
                    margin: 0;
                    font-size: 1.2rem;
                }
                .promo-modal-close {
                    background: transparent;
                    border: none;
                    color: #a0a0a0;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .promo-modal-empty {
                    color: #a0a0a0;
                    font-style: italic;
                    margin: 1rem 0;
                }
                .promo-modal-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.5rem;
                }
                .promo-modal-table th,
                .promo-modal-table td {
                    padding: 0.75rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    text-align: left;
                }
                .promo-modal-table th {
                    color: #a0a0a0;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                }
                .mono {
                    font-family: 'Roboto Mono', monospace;
                    color: #e94560;
                }
                .promo-modal-form h3 {
                    margin: 0 0 1rem;
                    font-size: 1rem;
                    color: #53bf9d;
                }
                .promo-modal-form-row {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .custom-input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: #0f3460;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                }
                .delete-btn {
                    background: rgba(233, 69, 96, 0.1);
                    border: 1px solid rgba(233, 69, 96, 0.2);
                    color: #e94560;
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: 6px;
                }
                .error-message {
                    color: #e94560;
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    );
};

export default PromoChatDetailModal;
