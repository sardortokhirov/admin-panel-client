
import React, { useState, useEffect, useCallback } from 'react';
import { usersService } from '../api/usersService';
import { setAuthHeader } from '../api/apiService';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaTrash, FaUserEdit, FaBan, FaCheck, FaEye, FaSearch } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [pageData, setPageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        blocked: '',
        language: '',
        hasBalance: '',
        searchChatId: '',
        searchPhone: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({});

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Clean filters
            const params = {
                page,
                size,
                ...appliedFilters
            };

            // Remove empty strings
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await usersService.getUsers(params);
            setPageData(response.data);
            setSelectedIds([]);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Foydalanuvchilarni yuklashda xatolik yuz berdi.");
        } finally {
            setIsLoading(false);
        }
    }, [page, size, appliedFilters]);

    useEffect(() => {
        const storedAuth = localStorage.getItem("authData");
        if (storedAuth) {
            const { token } = JSON.parse(storedAuth);
            setAuthHeader(token);
        }
        fetchUsers();
    }, [fetchUsers]);

    // Handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setAppliedFilters({ ...filters });
    };

    const handleClearFilters = () => {
        setFilters({
            blocked: '',
            language: '',
            hasBalance: '',
            searchChatId: '',
            searchPhone: ''
        });
        setAppliedFilters({});
        setPage(0);
    };

    const handleViewDetails = (chatId) => {
        navigate(`/users/${chatId}`);
    };

    // Bulk Actions
    const handleBulkBlock = async () => {
        if (!window.confirm(`Tanlangan ${selectedIds.length} ta foydalanuvchini bloklamoqchimisiz?`)) return;
        try {
            await usersService.bulkBlock(selectedIds);
            alert("Foydalanuvchilar bloklandi.");
            fetchUsers();
            setSelectedIds([]);
        } catch (err) {
            alert("Bloklashda xatolik: " + err.message);
        }
    };

    const handleBulkUnblock = async () => {
        if (!window.confirm(`Tanlangan ${selectedIds.length} ta foydalanuvchini blokdan chiqarmoqchimisiz?`)) return;
        try {
            await usersService.bulkUnblock(selectedIds);
            alert("Foydalanuvchilar blokdan chiqarildi.");
            fetchUsers();
            setSelectedIds([]);
        } catch (err) {
            alert("Blokdan chiqarishda xatolik: " + err.message);
        }
    };

    // Selection
    const handleSelect = (chatId) => {
        setSelectedIds(prev => prev.includes(chatId) ? prev.filter(i => i !== chatId) : [...prev, chatId]);
    };

    const handleSelectAll = (e) => {
        if (!pageData) return;
        if (e.target.checked) {
            setSelectedIds(pageData.content.map(u => u.chatId));
        } else {
            setSelectedIds([]);
        }
    };

    // Render Helpers
    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 });
    };

    const renderPagination = () => {
        if (!pageData || pageData.totalPages <= 1) return null;
        const { number, totalPages, first, last } = pageData;
        const currentPage = number + 1;

        return (
            <div className="pagination-controls">
                <Button onClick={() => setPage(number - 1)} disabled={first || isLoading} secondary>
                    <FiChevronLeft /> Oldingi
                </Button>
                <span>Sahifa <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (Jami: {pageData.totalElements})</span>
                <Button onClick={() => setPage(number + 1)} disabled={last || isLoading} secondary>
                    Keyingi <FiChevronRight />
                </Button>
            </div>
        );
    };

    return (
        <div className="page-container users-page">
            <div className="page-header">
                <h1>Foydalanuvchilar</h1>
            </div>

            {/* Filters Section */}
            <div className="filters-container" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group">
                        <label>Qidiruv (Chat ID)</label>
                        <input
                            type="number"
                            name="searchChatId"
                            value={filters.searchChatId}
                            onChange={handleFilterChange}
                            placeholder="Chat ID..."
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Telefon Raqam</label>
                        <input
                            type="text"
                            name="searchPhone"
                            value={filters.searchPhone}
                            onChange={handleFilterChange}
                            placeholder="+998..."
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Til</label>
                        <select
                            name="language"
                            value={filters.language}
                            onChange={handleFilterChange}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                        >
                            <option value="">Barchasi</option>
                            <option value="UZ">O'zbekcha</option>
                            <option value="RU">Ruscha</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Holat</label>
                        <select
                            name="blocked"
                            value={filters.blocked}
                            onChange={handleFilterChange}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                        >
                            <option value="">Barchasi</option>
                            <option value="false">Faol</option>
                            <option value="true">Bloklangan</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Balans</label>
                        <select
                            name="hasBalance"
                            value={filters.hasBalance}
                            onChange={handleFilterChange}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                        >
                            <option value="">Barchasi</option>
                            <option value="true">Bor</option>
                            <option value="false">Yo'q</option>
                        </select>
                    </div>
                    <Button type="submit" primary><FaSearch /> Qidirish</Button>
                    <Button type="button" secondary onClick={handleClearFilters}><FiRefreshCw /> Tozalash</Button>
                </form>
            </div>

            {/* Bulk Actions */}
            <div className="table-actions" style={{ marginBottom: '15px' }}>
                {selectedIds.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button danger onClick={handleBulkBlock}>
                            <FaBan /> Bloklash ({selectedIds.length})
                        </Button>
                        <Button success onClick={handleBulkUnblock}>
                            <FaCheck /> Blokdan Chiqarish ({selectedIds.length})
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            {isLoading ? <Loader /> : error ? <p className="error-message">{error}</p> : (
                <div className="transaction-list-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={pageData?.content?.length > 0 && selectedIds.length === pageData?.content?.length}
                                        disabled={!pageData?.content?.length}
                                    />
                                </th>
                                <th>Chat ID</th>
                                <th>Telefon</th>
                                <th>Til</th>
                                <th>Balans</th>
                                <th>Biletlar</th>
                                <th>Limit (Kunlik)</th>
                                <th>Holati</th>
                                <th>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData?.content?.length > 0 ? pageData.content.map(user => (
                                <tr key={user.chatId} className={selectedIds.includes(user.chatId) ? 'selected' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(user.chatId)}
                                            onChange={() => handleSelect(user.chatId)}
                                        />
                                    </td>
                                    <td>{user.chatId}</td>
                                    <td>{user.phoneNumber || '-'}</td>
                                    <td>{user.language}</td>
                                    <td>{formatCurrency(user.balance)}</td>
                                    <td>{user.tickets}</td>
                                    <td>{formatCurrency(user.effectiveDailyLimit)}</td>
                                    <td>
                                        {user.isBlocked ? (
                                            <span style={{ color: '#e94560', fontWeight: 'bold' }}>Bloklangan</span>
                                        ) : (
                                            <span style={{ color: '#53bf9d', fontWeight: 'bold' }}>Faol</span>
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            secondary
                                            style={{ padding: '5px 10px', fontSize: '0.9rem' }}
                                            onClick={() => handleViewDetails(user.chatId)}
                                        >
                                            <FaEye />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="9" className="no-data" style={{
                                        textAlign: 'center',
                                        padding: '50px',
                                        color: '#a0a0a0',
                                        fontSize: '1.2rem'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <FaSearch size={30} style={{ opacity: 0.5 }} />
                                            <span>Foydalanuvchi topilmadi</span>
                                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Qidiruv parametrlarini o'zgartirib ko'ring</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {renderPagination()}
        </div>
    );
};

export default UserManagementPage;
