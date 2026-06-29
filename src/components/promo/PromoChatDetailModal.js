import React, { useCallback, useEffect, useState } from 'react';
import { promoService } from '../../api/promoService';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { FiX, FiTrash2, FiPlus, FiMinus, FiLink, FiLayers } from 'react-icons/fi';

const emptyRow = () => ({
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platformName: '',
    platformUserId: '',
});

const PromoChatDetailModal = ({ chatId, onClose, onLinksChanged }) => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [draftRows, setDraftRows] = useState([emptyRow()]);

    const loadLinks = useCallback(async () => {
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
    }, [chatId]);

    useEffect(() => {
        if (chatId) {
            setDraftRows([emptyRow()]);
            setSuccess(null);
            loadLinks();
        }
    }, [chatId, loadLinks]);

    const updateDraftRow = (key, field, value) => {
        setDraftRows((rows) =>
            rows.map((row) => (row.key === key ? { ...row, [field]: value } : row))
        );
    };

    const addDraftRow = () => {
        setDraftRows((rows) => [...rows, emptyRow()]);
    };

    const removeDraftRow = (key) => {
        setDraftRows((rows) => {
            if (rows.length === 1) {
                return [{ ...rows[0], platformName: '', platformUserId: '' }];
            }
            return rows.filter((row) => row.key !== key);
        });
    };

    const handleAddAll = async (e) => {
        e.preventDefault();
        const validRows = draftRows
            .map((row) => ({
                platformName: row.platformName.trim(),
                platformUserId: row.platformUserId.trim(),
            }))
            .filter((row) => row.platformName || row.platformUserId);

        if (validRows.length === 0) {
            setError('Kamida bitta kontora nomi va platforma ID kiriting.');
            return;
        }

        const incomplete = validRows.some((row) => !row.platformName || !row.platformUserId);
        if (incomplete) {
            setError('Har bir qator uchun kontora nomi va platforma ID to\'liq bo\'lishi kerak.');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        const failed = [];
        let added = 0;

        for (const row of validRows) {
            try {
                await promoService.addChatLink(chatId, row);
                added += 1;
            } catch (err) {
                const msg = err?.response?.data?.message || err?.response?.data;
                failed.push(
                    `${row.platformName} (${row.platformUserId}): ${
                        typeof msg === 'string' ? msg : 'xatolik'
                    }`
                );
            }
        }

        setDraftRows([emptyRow()]);
        await loadLinks();
        onLinksChanged?.();

        if (added > 0 && failed.length === 0) {
            setSuccess(`${added} ta platforma muvaffaqiyatli qo'shildi.`);
        } else if (added > 0 && failed.length > 0) {
            setSuccess(`${added} ta qo'shildi.`);
            setError(`Ba'zilari qo'shilmadi:\n${failed.join('\n')}`);
        } else {
            setError(failed.length ? failed.join('\n') : 'Qo\'shishda xatolik.');
        }

        setSaving(false);
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
                    <div>
                        <p className="promo-modal-label">Chat ID</p>
                        <h2 className="promo-modal-chat-id">{chatId}</h2>
                    </div>
                    <div className="promo-modal-header-right">
                        <span className="promo-modal-badge">
                            <FiLink /> {links.length} ta platforma
                        </span>
                        <button type="button" className="promo-modal-close" onClick={onClose} aria-label="Yopish">
                            <FiX />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <section className="promo-modal-section">
                            <div className="section-title">
                                <FiLayers />
                                <span>Bog'langan platformalar</span>
                            </div>
                            {links.length === 0 ? (
                                <div className="promo-modal-empty">
                                    <p>Hali platforma bog'lanmagan.</p>
                                    <span>Pastdagi formadan bir yoki bir nechta platforma qo'shing.</span>
                                </div>
                            ) : (
                                <div className="promo-modal-table-wrap">
                                    <table className="promo-modal-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Kontora nomi</th>
                                                <th>Platforma ID</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {links.map((link, index) => (
                                                <tr key={link.id}>
                                                    <td className="row-num">{index + 1}</td>
                                                    <td>{link.platformName}</td>
                                                    <td className="mono">{link.platformUserId}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="icon-btn danger"
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
                                </div>
                            )}
                        </section>

                        <section className="promo-modal-section add-section">
                            <div className="section-title">
                                <FiPlus />
                                <span>Platforma qo'shish</span>
                            </div>
                            <p className="section-hint">
                                Bir nechta platforma qo'shish uchun <strong>+</strong> tugmasini bosing, keyin barchasini birga saqlang.
                            </p>

                            <form onSubmit={handleAddAll}>
                                <div className="draft-rows">
                                    <div className="draft-header">
                                        <span>Kontora nomi</span>
                                        <span>Platforma ID</span>
                                        <span></span>
                                    </div>
                                    {draftRows.map((row, index) => (
                                        <div className="draft-row" key={row.key}>
                                            <input
                                                type="text"
                                                className="custom-input"
                                                placeholder={index === 0 ? 'masalan: 1xbet' : 'Kontora nomi'}
                                                maxLength={80}
                                                value={row.platformName}
                                                onChange={(e) => updateDraftRow(row.key, 'platformName', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="custom-input"
                                                placeholder="Platforma foydalanuvchi ID"
                                                value={row.platformUserId}
                                                onChange={(e) => updateDraftRow(row.key, 'platformUserId', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="icon-btn muted"
                                                onClick={() => removeDraftRow(row.key)}
                                                title="Qatorni o'chirish"
                                                disabled={draftRows.length === 1 && !row.platformName && !row.platformUserId}
                                            >
                                                <FiMinus />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="add-row-btn" onClick={addDraftRow}>
                                        <FiPlus /> Yana platforma
                                    </button>
                                    <Button primary type="submit" disabled={saving}>
                                        {saving ? 'Saqlanmoqda...' : `Saqlash (${draftRows.length})`}
                                    </Button>
                                </div>
                            </form>

                            {success && <div className="success-message">{success}</div>}
                            {error && <div className="error-message">{error}</div>}
                        </section>
                    </>
                )}
            </div>

            <style jsx="true">{`
                .promo-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.72);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .promo-modal {
                    background: linear-gradient(180deg, #1a2744 0%, #16213e 100%);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
                    max-width: 720px;
                    width: 100%;
                    max-height: 92vh;
                    overflow-y: auto;
                    padding: 1.5rem 1.75rem 1.75rem;
                    color: #fff;
                }
                .promo-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .promo-modal-label {
                    margin: 0 0 0.25rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #8b9cb8;
                }
                .promo-modal-chat-id {
                    margin: 0;
                    font-size: 1.35rem;
                    font-family: 'Roboto Mono', monospace;
                    color: #53bf9d;
                }
                .promo-modal-header-right {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .promo-modal-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.8rem;
                    padding: 0.35rem 0.65rem;
                    border-radius: 999px;
                    background: rgba(83, 191, 157, 0.15);
                    color: #53bf9d;
                    border: 1px solid rgba(83, 191, 157, 0.25);
                    white-space: nowrap;
                }
                .promo-modal-close {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: #a0a0a0;
                    font-size: 1.25rem;
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .promo-modal-section {
                    margin-bottom: 1.25rem;
                }
                .add-section {
                    background: rgba(15, 52, 96, 0.45);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 1rem 1.1rem 1.1rem;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #e8edf5;
                }
                .section-hint {
                    margin: 0 0 1rem;
                    font-size: 0.85rem;
                    color: #9aa8be;
                    line-height: 1.45;
                }
                .promo-modal-empty {
                    text-align: center;
                    padding: 1.5rem 1rem;
                    border: 1px dashed rgba(255,255,255,0.15);
                    border-radius: 10px;
                    background: rgba(0,0,0,0.15);
                }
                .promo-modal-empty p {
                    margin: 0 0 0.35rem;
                    color: #c5d0e0;
                }
                .promo-modal-empty span {
                    font-size: 0.85rem;
                    color: #8b9cb8;
                }
                .promo-modal-table-wrap {
                    overflow-x: auto;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .promo-modal-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .promo-modal-table th,
                .promo-modal-table td {
                    padding: 0.7rem 0.85rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    text-align: left;
                }
                .promo-modal-table th {
                    color: #8b9cb8;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    background: rgba(0,0,0,0.2);
                }
                .promo-modal-table tr:last-child td {
                    border-bottom: none;
                }
                .row-num {
                    color: #8b9cb8;
                    width: 2rem;
                }
                .mono {
                    font-family: 'Roboto Mono', monospace;
                    color: #e94560;
                }
                .draft-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 0.55rem;
                    margin-bottom: 1rem;
                }
                .draft-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 40px;
                    gap: 0.6rem;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #8b9cb8;
                    padding: 0 0.15rem;
                }
                .draft-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 40px;
                    gap: 0.6rem;
                    align-items: center;
                }
                .custom-input {
                    width: 100%;
                    padding: 0.7rem 0.85rem;
                    background: #0f3460;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.95rem;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }
                .custom-input:focus {
                    border-color: rgba(83, 191, 157, 0.6);
                    box-shadow: 0 0 0 3px rgba(83, 191, 157, 0.12);
                }
                .icon-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    color: #c5d0e0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-btn.danger {
                    background: rgba(233, 69, 96, 0.12);
                    border-color: rgba(233, 69, 96, 0.25);
                    color: #e94560;
                }
                .icon-btn.muted:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .form-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    justify-content: space-between;
                    align-items: center;
                }
                .add-row-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.55rem 0.9rem;
                    border-radius: 8px;
                    border: 1px dashed rgba(83, 191, 157, 0.45);
                    background: rgba(83, 191, 157, 0.08);
                    color: #53bf9d;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .add-row-btn:hover {
                    background: rgba(83, 191, 157, 0.15);
                }
                .success-message {
                    color: #53bf9d;
                    margin-top: 0.85rem;
                    font-size: 0.9rem;
                }
                .error-message {
                    color: #e94560;
                    margin-top: 0.85rem;
                    font-size: 0.9rem;
                    white-space: pre-line;
                }
                @media (max-width: 600px) {
                    .draft-header { display: none; }
                    .draft-row {
                        grid-template-columns: 1fr;
                        padding: 0.75rem;
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 10px;
                        background: rgba(0,0,0,0.15);
                    }
                    .form-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            `}</style>
        </div>
    );
};

export default PromoChatDetailModal;
