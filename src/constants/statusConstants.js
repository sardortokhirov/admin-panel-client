import React from 'react';
import {
    FaSpinner, FaTimesCircle, FaImage, FaCheckCircle,
    FaClock, FaUserShield, FaSms, FaHourglassHalf,
    FaExclamationTriangle, FaBan, FaArrowDown, FaArrowUp,
    FaCoins, FaWallet, FaExchangeAlt
} from 'react-icons/fa';

export const STATUS_MAP = {
    PENDING: {
        label: 'Kutilmoqda',
        color: '#fca130',
        icon: <FaClock />,
        className: 'status--pending'
    },
    PENDING_SMS: {
        label: 'SMS Kutilmoqda',
        color: '#fca130',
        icon: <FaSms />,
        className: 'status--pending-sms'
    },
    PENDING_ADMIN: {
        label: 'Admin Tasdig\'i',
        color: '#fca130',
        icon: <FaUserShield />,
        className: 'status--pending-admin'
    },
    APPROVED: {
        label: 'Tasdiqlangan',
        color: '#53bf9d',
        icon: <FaCheckCircle />,
        className: 'status--approved'
    },
    BONUS_APPROVED: {
        label: 'Bonus Berildi',
        color: '#9b59b6',
        icon: <FaCheckCircle />,
        className: 'status--bonus-approved'
    },
    CANCELED: {
        label: 'Bekor Qilingan',
        color: '#6c757d',
        icon: <FaBan />,
        className: 'status--canceled'
    },
    PENDING_PAYMENT: {
        label: 'To\'lov Kutilyapti',
        color: '#fca130',
        icon: <FaHourglassHalf />,
        className: 'status--pending-payment'
    },
    FAILED: {
        label: 'Xatolik',
        color: '#ff5c5c',
        icon: <FaExclamationTriangle />,
        className: 'status--failed'
    },
    PENDING_SCREENSHOT: {
        label: 'Skrinshot Kutilyapti',
        color: '#e67e22',
        icon: <FaImage />,
        className: 'status--pending-screenshot'
    },
    PROCESSING: {
        label: 'Jarayonda',
        color: '#3498db',
        icon: <FaSpinner className="spin" />,
        className: 'status--processing'
    },
    USER_CANCELED: {
        label: 'Foydalanuvchi Bekor Qildi',
        color: '#34495e',
        icon: <FaTimesCircle />,
        className: 'status--user-canceled'
    }
};

export const TRANSACTION_TYPE_MAP = {
    TOP_UP: {
        label: 'Kirim',
        color: '#53bf9d',
        icon: <FaArrowDown />
    },
    WITHDRAWAL: {
        label: 'Chiqim',
        color: '#36a2eb',
        icon: <FaArrowUp />
    },
    TIP: {
        label: 'Bot Rivoji',
        color: '#f39c12',
        icon: <FaCoins />
    },
    WALLET_DEPOSIT: {
        label: 'Hamyonga To\'lov',
        color: '#53bf9d',
        icon: <FaWallet />
    },
    WALLET_WITHDRAWAL: {
        label: 'Hamyondan Yechish',
        color: '#e94560',
        icon: <FaWallet />
    },
    WALLET_TO_PLATFORM: {
        label: 'Platformaga O\'tkazish',
        color: '#9b59b6',
        icon: <FaExchangeAlt />
    },
    WALLET_TO_WALLET: {
        label: 'Hamyondan Hamyonga',
        color: '#1abc9c',
        icon: <FaExchangeAlt />
    },
    TICKET_TRADE: {
        label: 'Chipta Savdosi',
        color: '#8e44ad',
        icon: <FaCoins />
    }
};

export const getStatusInfo = (status) => STATUS_MAP[status] || {
    label: status,
    color: '#aaa',
    icon: null,
    className: 'status--default'
};

export const getTypeInfo = (type) => TRANSACTION_TYPE_MAP[type] || {
    label: type,
    color: '#aaa',
    icon: null
};
