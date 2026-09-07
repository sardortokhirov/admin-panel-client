import React, { useState, useEffect } from "react";
// import { apiService } from "../api/apiService";
// import Loader from "../components/common/Loader";
// import Button from "../components/common/Button";
import { FiLock, FiX } from "react-icons/fi";
import apiService from "../api/HumoService";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import { TbTrash } from "react-icons/tb";

const HumoService = () => {
  const [step, setStep] = useState(1); // 1: phone, 2: code, 3: password
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [hint, setHint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '...' }
  const [, setNotificationError] = useState(null);
  const [accounts, setAccounts] = useState(null); // { type: 'success'|'error', message: '...' }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);
    try {
      const response = await apiService.newNumber({ phone });
      setNotification({ type: "success", message: response.message });
      setStep(2);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Xatolik yuz berdi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);
    try {
      const response = await apiService.smsCode({ phone, code });

      console.log("response", response);

      if (response?.data?.next === "POST /twostep") {
        setHint(response?.data?.hint);
        setStep(3);
      } else {
        setNotification({ type: "success", message: response.message });
        // Muvaffaqiyatli login, masalan, /active ga redirect
        // window.location.href = "/active";
        // fetchActive()
        window.location.href = "/humo";
      }
    } catch (err) {
      console.log("3333");
      setNotification({
        type: "error",
        message: err.message || "Xatolik yuz berdi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);
    try {
      const response = await apiService.twoStep({ phone, password });
      setNotification({ type: "success", message: response.message });
      // Muvaffaqiyatli, /active ga redirect
      window.location.href = "/humo";
    } catch (err) {
      console.log("err", err);

      setNotification({
        type: "error",
        message: err.response?.data?.detail || "Xatolik yuz berdi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchActive = async () => {
    setLoading(true);
    setNotificationError();
    try {
      const res = await apiService.active({ include_photo: true }); // query param
      // axios returns { data: ... }
      setAccounts(res.data ?? []);
    } catch (err) {
      console.error("fetchActive error:", err);
      setNotificationError(
        err.response?.data?.detail || err.message || "Noma'lum xato"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (phone) => {
    setLoading(true);
    setNotificationError();
    try {
      const response = await apiService.deleteAccount(phone);
      fetchActive();
      console.log("response", response);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Xatolik yuz berdi",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-container main-content">
      {loading ? (
        <div
          className="loader-container"
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            top: 0,
            left: 0,
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="loader"></div>
        </div>
      ) : (
        ""
      )}

      {/* <div className="dashboard-header filter-controls ">
        <button
          onClick={() => console.log("7d")}
          className={1 === "7d" ? "active" : ""}
        >
          7 Kun
        </button>
      </div> */}
      <div className="page-header">
        <h1>Telegram Login</h1>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className="notification-close-btn"
          >
            <FiX />
          </button>
        </div>
      )}

      <div style={{ marginBottom: "20px" }} className="login-form-panel">
        {step === 1 && (
          <form onSubmit={handlePhoneSubmit} className="form">
            <div>
              <label htmlFor="phone">Telefon raqami</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+998XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" primary disabled={isSubmitting}>
              {isSubmitting ? <Loader /> : ""}
              SMS kod yuborish
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="form">
            <div className="form__group">
              <label htmlFor="code">SMS kod{phone ? `: ${phone}` : ""}</label>
              <input
                type="text"
                id="code"
                name="code"
                placeholder="XXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" primary disabled={isSubmitting}>
              {isSubmitting ? <Loader /> : ""}
              Tasdiqlash
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="form">
            <div className="form__group">
              <label htmlFor="password">Ikkilamchi parol</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={hint ?? "Parolni kiriting"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* {hint && <p className="hint">Maslahat: {hint}</p>} */}
            </div>
            <Button type="submit" primary disabled={isSubmitting}>
              {isSubmitting ? <Loader /> : <FiLock />}
              Kirish
            </Button>
          </form>
        )}
      </div>

      <div className="login-form-panel">
        {accounts?.length > 0 ? (
          <>
            {accounts.map((account) => (
              <div key={account.id} className="account-item">
                <img
                  src={`data:image/jpeg;base64,${account.profilePicture}`}
                  alt={account.name}
                  className="account-profile-pic"
                />
                <div className="account-details">
                  <h2>{account.name}</h2>
                  <p>Username: {account.username}</p>
                  <p>Phone: {account.phone}</p>
                  <p>
                    Status:
                    <span> {account.status}</span>
                  </p>
                </div>

                <div>
                  <button
                    style={{ fontSize: "20px" }}
                    className="navbar__logout"
                    onClick={() => handleDeleteAccount(account.phone)}
                  >
                    <TbTrash />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>Profillar mavjud emas.</p>
        )}
      </div>
    </div>
  );
};

export default HumoService;
