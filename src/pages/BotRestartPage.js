import React, { useState, useEffect, useCallback } from "react";
import { FiRefreshCw, FiCheck, FiAlertCircle } from "react-icons/fi";

const BotRestartPage = () => {
    const [isRestarting, setIsRestarting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(35);
    const [status, setStatus] = useState("idle"); // idle, restarting, success, error
    const [errorMessage, setErrorMessage] = useState("");

    const RESTART_API = "https://xonpey.shop:8087/restart";
    const COUNTDOWN_SECONDS = 35;

    const handleRestart = useCallback(async () => {
        setIsRestarting(true);
        setStatus("restarting");
        setTimeLeft(COUNTDOWN_SECONDS);
        setErrorMessage("");

        try {
            const response = await fetch(RESTART_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Xatolik: ${response.status}`);
            }

            // Start countdown timer
        } catch (error) {
            setStatus("error");
            setErrorMessage(error.message || "Bot qayta ishga tushirishda xatolik yuz berdi");
            setIsRestarting(false);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (isRestarting && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRestarting(false);
                        setStatus("success");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRestarting, timeLeft]);

    const getCircleProgress = () => {
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const progress = ((COUNTDOWN_SECONDS - timeLeft) / COUNTDOWN_SECONDS) * circumference;
        return circumference - progress;
    };

    const resetState = () => {
        setStatus("idle");
        setTimeLeft(COUNTDOWN_SECONDS);
        setErrorMessage("");
    };

    return (
        <div className="page-container main-content">
            <div className="page-header">
                <h1>Bot Restart</h1>
            </div>

            <div className="bot-restart-container">
                <div className="bot-restart-card">
                    {/* Timer Circle */}
                    <div className="timer-wrapper">
                        <svg className="timer-svg" viewBox="0 0 200 200">
                            {/* Background circle */}
                            <circle
                                className="timer-bg"
                                cx="100"
                                cy="100"
                                r="90"
                                fill="none"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            {status === "restarting" && (
                                <circle
                                    className="timer-progress"
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 90}
                                    strokeDashoffset={getCircleProgress()}
                                    strokeLinecap="round"
                                />
                            )}
                            {/* Animated glow effect */}
                            {status === "restarting" && (
                                <circle
                                    className="timer-glow"
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    strokeWidth="12"
                                    strokeDasharray={2 * Math.PI * 90}
                                    strokeDashoffset={getCircleProgress()}
                                    strokeLinecap="round"
                                />
                            )}
                        </svg>

                        {/* Center content */}
                        <div className="timer-content">
                            {status === "idle" && (
                                <div className="timer-icon idle">
                                    <FiRefreshCw />
                                </div>
                            )}
                            {status === "restarting" && (
                                <>
                                    <div className="timer-number">{timeLeft}</div>
                                    <div className="timer-label">soniya</div>
                                </>
                            )}
                            {status === "success" && (
                                <div className="timer-icon success">
                                    <FiCheck />
                                </div>
                            )}
                            {status === "error" && (
                                <div className="timer-icon error">
                                    <FiAlertCircle />
                                </div>
                            )}
                        </div>

                        {/* Particles effect during restart */}
                        {status === "restarting" && (
                            <div className="particles">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`particle particle-${i + 1}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status Text */}
                    <div className="status-text">
                        {status === "idle" && (
                            <p>Bot qayta ishga tushirish uchun tugmani bosing</p>
                        )}
                        {status === "restarting" && (
                            <p className="pulsing">Bot qayta ishga tushmoqda...</p>
                        )}
                        {status === "success" && (
                            <p className="success-text">Bot ishlayapti! ✓</p>
                        )}
                        {status === "error" && (
                            <p className="error-text">{errorMessage}</p>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="action-buttons">
                        {status === "idle" && (
                            <button
                                className="restart-btn"
                                onClick={handleRestart}
                            >
                                <FiRefreshCw className="btn-icon" />
                                Botni qayta ishga tushirish
                            </button>
                        )}
                        {status === "success" && (
                            <button
                                className="restart-btn success-btn"
                                onClick={resetState}
                            >
                                <FiCheck className="btn-icon" />
                                Tayyor
                            </button>
                        )}
                        {status === "error" && (
                            <button
                                className="restart-btn error-btn"
                                onClick={handleRestart}
                            >
                                <FiRefreshCw className="btn-icon" />
                                Qayta urinish
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="info-panel">
                    <h3>Ma'lumot</h3>
                    <ul>
                        <li>
                            <span className="info-icon">⏱️</span>
                            Bot qayta ishga tushishi 35 soniya vaqt oladi
                        </li>
                        <li>
                            <span className="info-icon">⚠️</span>
                            Jarayon davomida bot vaqtinchalik ishlamaydi
                        </li>
                        <li>
                            <span className="info-icon">✅</span>
                            Taymer tugagach, bot avtomatik tarzda ishlay boshlaydi
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BotRestartPage;
