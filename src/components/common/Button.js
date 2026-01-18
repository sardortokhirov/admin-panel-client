import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    primary,
    secondary,
    danger,
    success,
    warning,
    outline,
    small,
    disabled,
    className = '',
    ...rest
}) => {
    const classNames = [
        'btn',
        primary ? 'btn--primary' : '',
        secondary ? 'btn--secondary' : '',
        danger ? 'btn--danger' : '',
        success ? 'btn--success' : '',
        warning ? 'btn--warning' : '',
        outline ? 'btn--outline' : '',
        small ? 'btn--small' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;