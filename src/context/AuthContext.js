import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthHeader, clearAuthHeader } from "../api/apiService";
import { loginService } from "../api/loginService";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  encodeBasicToken,
  getAuthToken,
  isAuthFailure,
  setAuthToken,
} from "../api/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  const getDeviceName = (userAgent) => {
    if (/windows/i.test(userAgent)) return "Windows PC";
    if (/macintosh/i.test(userAgent)) return "Mac";
    if (/linux/i.test(userAgent)) return "Linux PC";
    if (/iphone/i.test(userAgent)) return "iPhone";
    if (/ipad/i.test(userAgent)) return "iPad";
    if (/android/i.test(userAgent)) return "Android Device";
    return "Unknown Device";
  };

  const logout = useCallback((redirect = true) => {
    clearAuthToken();
    clearAuthHeader();
    setIsAuthenticated(false);
    setAuthReady(true);
    if (redirect && window.location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setAuthReady(true);
        }
        return;
      }

      setAuthHeader(token);
      try {
        await loginService.verifyAuth();
        if (!cancelled) {
          setIsAuthenticated(true);
          setAuthReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          if (isAuthFailure(err)) {
            clearAuthToken();
            clearAuthHeader();
            setIsAuthenticated(false);
            setAuthReady(true);
            if (window.location.pathname !== "/login") {
              navigate("/login", { replace: true });
            }
          } else {
            setIsAuthenticated(true);
            setAuthReady(true);
          }
        }
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const onUnauthorized = () => logout(true);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  const login = async (username, password) => {
    const token = encodeBasicToken(username, password);
    setAuthHeader(token);

    try {
      await loginService.verifyAuth();
      setAuthToken(token);
      setIsAuthenticated(true);
      setAuthReady(true);

      try {
        const geoResponse = await fetch("https://ipapi.co/json/");
        const geoData = await geoResponse.json();
        await loginService.recordLogin({
          username,
          userAgent: navigator.userAgent,
          ipAddress: geoData.ip,
          deviceName: getDeviceName(navigator.userAgent),
          city: geoData.city,
          country: geoData.country_name,
        });
      } catch (recordError) {
        console.error("Failed to record login event, but login is successful:", recordError);
      }

      navigate("/");
    } catch (error) {
      clearAuthToken();
      clearAuthHeader();
      setIsAuthenticated(false);
      throw new Error("Authentication failed");
    }
  };

  const value = { isAuthenticated, authReady, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
