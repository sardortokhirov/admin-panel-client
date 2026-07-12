import React from 'react';
import {
    FaArrowDown,
    FaArrowUp,
    FaBan,
    FaCheckCircle,
    FaClock,
    FaExchangeAlt,
    FaExclamationTriangle,
    FaHourglassHalf,
    FaImage,
    FaRedoAlt,
    FaSms,
    FaSpinner,
    FaTimesCircle,
    FaUserShield,
    FaWallet,
} from 'react-icons/fa';

export const STATUS_MAP = {
    PENDING: {
        label: 'Kutilmoqda',
        color: '#fca130',
        icon: <FaClock />,
        className: 'status--pending',
    },
    PENDING_SMS: {
        label: 'SMS Kutilmoqda',
        color: '#fca130',
        icon: <FaSms />,
        className: 'status--pending-sms',
    },
    PENDING_ADMIN: {
        label: "Admin Tasdig'i",
        color: '#fca130',
        icon: <FaUserShield />,
        className: 'status--pending-admin',
    },
    APPROVED: {
        label: 'Tasdiqlangan',
        color: '#53bf9d',
        icon: <FaCheckCircle />,
        className: 'status--approved',
    },
    BONUS_APPROVED: {
        label: 'Bonus Berildi',
        color: '#9b59b6',
        icon: <FaCheckCircle />,
        className: 'status--bonus-approved',
    },
    CANCELED: {
        label: 'Bekor Qilingan',
        color: '#6c757d',
        icon: <FaBan />,
        className: 'status--canceled',
    },
    USER_CANCELED: {
        label: 'Foydalanuvchi Bekor Qildi',
        color: '#64748b',
        icon: <FaTimesCircle />,
        className: 'status--user-canceled',
    },
    PENDING_PAYMENT: {
        label: "To'lov Kutilyapti",
        color: '#fca130',
        icon: <FaHourglassHalf />,
        className: 'status--pending-payment',
    },
    PENDING_SCREENSHOT: {
        label: 'Skrinshot Kutilyapti',
        color: '#e67e22',
        icon: <FaImage />,
        className: 'status--pending-screenshot',
    },
    PROCESSING: {
        label: 'Jarayonda',
        color: '#3498db',
        icon: <FaSpinner className="spin" />,
        className: 'status--processing',
    },
    FAILED: {
        label: 'Xatolik',
        color: '#ff5c5c',
        icon: <FaExclamationTriangle />,
        className: 'status--failed',
    },
    FAILED_REFUNDED: {
        label: 'Xatolik - Qaytarildi',
        color: '#10b981',
        icon: <FaRedoAlt />,
        className: 'status--failed-refunded',
    },
};

export const TRANSACTION_TYPE_MAP = {
    TOP_UP: {
        label: "Hisob To'ldirish",
        color: '#53bf9d',
        icon: <FaArrowDown />,
    },
    WITHDRAWAL: {
        label: 'Pul Yechish',
        color: '#36a2eb',
        icon: <FaArrowUp />,
    },
    WALLET_WITHDRAWAL: {
        label: 'Hamyondan Kartaga',
        color: '#e94560',
        icon: <FaWallet />,
    },
    WALLET_TO_PLATFORM: {
        label: "Hamyondan Platformaga",
        color: '#9b59b6',
        icon: <FaExchangeAlt />,
    },
};

export const getStatusInfo = (status) => STATUS_MAP[status] || {
    label: status || '-',
    color: '#94a3b8',
    icon: null,
    className: 'status--default',
};

export const getTypeInfo = (type) => TRANSACTION_TYPE_MAP[type] || {
    label: type || '-',
    color: '#94a3b8',
    icon: null,
};
