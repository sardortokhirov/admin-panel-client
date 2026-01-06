// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthHeader, clearAuthHeader } from "../api/apiService";
import { loginService } from "../api/loginService";
import { dashboardService } from "../api/dashboardService"; // Added for auth verification

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authData")
  );
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = localStorage.getItem("authData");
    if (storedAuth) {
      const { token, expiry } = JSON.parse(storedAuth);
      // Check if the token has expired
      if (new Date().getTime() > expiry) {
        logout();
      } else {
        setAuthHeader(token);
        setIsAuthenticated(true);
      }
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
      // 3. THE CRITICAL STEP: Make a "test" call to a protected endpoint.
      // 3. THE CRITICAL STEP: Make a "test" call to a protected endpoint.
      // We use getDashboardStats() to verify authentication.
      await dashboardService.getDashboardStats();

      // 4. If the call succeeded, the credentials are valid! Now we can proceed.
      // Permanently save the token with an expiry of 3 days
      const expiry = new Date().getTime() + 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      localStorage.setItem("authData", JSON.stringify({ token, expiry }));

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
    localStorage.removeItem("authData");
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
