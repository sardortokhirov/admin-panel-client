// src/components/layout/Navbar.js

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Dropdown from "./Dropdown"; // <-- IMPORT ahe new component

const Navbar = () => {
    const { logout } = useAuth();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="navbar__brand">
                <NavLink to="/">Admin Panel</NavLink>
            </div>
            <div className="navbar__menu-toggle" onClick={toggleMobileMenu}>
                <div className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* The links container now includes dropdowns */}
            <div className={`navbar__links ${isMobileMenuOpen ? "open" : ""}`}>
                {/* Standalone Link */}
                <div className="navbar__item">
                    <NavLink to="/" onClick={closeMobileMenu}>
                        Boshqaruv Paneli
                    </NavLink>
                </div>

                {/* Management Dropdown */}
                <div className="navbar__item">
                    <Dropdown title="Boshqaruv">
                        <NavLink to="/cards" onClick={closeMobileMenu}>
                            Kartalar
                        </NavLink>
                        <NavLink to="/platforms" onClick={closeMobileMenu}>
                            Platformalar
                        </NavLink>
                        <NavLink to="/transactions" onClick={closeMobileMenu}>
                            Tranzaksiyalar
                        </NavLink>
                        <NavLink to="/lottery" onClick={closeMobileMenu}>
                            Lotereya
                        </NavLink>
                        {/* YANGI LINK: UsersPage (Balanslar ro'yxati) */}
                        <NavLink to="/users" onClick={closeMobileMenu}>
                            Foydalanuvchi Balanslari
                        </NavLink>
                        {/* YANGI LINK TUGADI */}
                    </Dropdown>
                </div>

                {/* Security Dropdown */}
                <div className="navbar__item">
                    <Dropdown title="Xavfsizlik">
                        <NavLink to="/admins" onClick={closeMobileMenu}>
                            Adminlar
                        </NavLink>
                        <NavLink to="/login-devices" onClick={closeMobileMenu}>
                            Kirishlar Tarixi
                        </NavLink>
                    </Dropdown>
                </div>

                {/* Settings/Tools Dropdown */}
                <div className="navbar__item">
                    <Dropdown title="Sozlamalar">
                        <NavLink to="/currency" onClick={closeMobileMenu}>
                            Valyuta Kurslari
                        </NavLink>
                        <NavLink to="/oson-configs" onClick={closeMobileMenu}>
                            Oson Configs
                        </NavLink>
                        <NavLink to="/broadcast" onClick={closeMobileMenu}>
                            Broadcast
                        </NavLink>
                        <NavLink to="/humo" onClick={closeMobileMenu}>
                            Humo Service
                        </NavLink>
                        <NavLink to="/system-config" onClick={closeMobileMenu}>
                            Tizim Sozlamalari
                        </NavLink>
                    </Dropdown>
                </div>

                {/* Logout Button */}
                <div className="navbar__item">
                    <button onClick={logout} className="navbar__logout">
                        Chiqish
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;