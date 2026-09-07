// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthHeader, clearAuthHeader } from "../api/apiService";
import { loginService } from "../api/loginService"; // We need this to make our test call

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthHeader(token);
      setIsAuthenticated(true);
    }
  }, []);

  const getDeviceName = (userAgent) => {
    if (/windows/i.test(userAgent)) return "Windows PC";
    if (/macintosh/i.test(userAgent)) return "Mac";
    if (/linux/i.test(userAgent)) return "Linux PC";
    if (/iphone/i.test(userAgent)) return "iPhone";
    if (/ipad/i.test(userAgent)) return "iPad";
    if (/android/i.test(userAgent)) return "Android Device";
    return "Unknown Device";
  };

  // ===================================================================
  // THE NEW, SECURE LOGIN FUNCTION
  // ===================================================================
  const login = async (username, password) => {
    // 1. Create the potential auth token
    const token = btoa(`${username}:${password}`);

    // 2. Set the header TEMPORARILY for our test API call
    setAuthHeader(token);

    try {
      // Probe a protected endpoint. Wrong credentials return 401 and stay on login.
      await loginService.verifyAuth();

      // 4. If the call succeeded, the credentials are valid! Now we can proceed.
      // Permanently save the token
      localStorage.setItem("authToken", token);

      // Set the state to re-render the app
      setIsAuthenticated(true);

      // Record the successful login event (this can run in the background)
      try {
        const geoResponse = await fetch("https://ipapi.co/json/");
        const geoData = await geoResponse.json();
        const loginData = {
          username: username,
          userAgent: navigator.userAgent,
          ipAddress: geoData.ip,
          deviceName: getDeviceName(navigator.userAgent),
          city: geoData.city,
          country: geoData.country_name,
        };
        await loginService.recordLogin(loginData);
      } catch (recordError) {
        console.error(
          "Failed to record login event, but login is successful:",
          recordError
        );
      }

      // 5. Navigate to the dashboard
      navigate("/");
    } catch (error) {
      // 6. If the test call failed, the credentials are bad.
      // Clear the temporary (and incorrect) auth header
      clearAuthHeader();

      // Throw a new error that the LoginPage component can catch and display.
      throw new Error("Authentication failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    clearAuthHeader();
    setIsAuthenticated(false);
    navigate("/login");
  };

  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
