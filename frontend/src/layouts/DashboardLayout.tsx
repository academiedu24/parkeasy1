"use client"

import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, Square, Car, CreditCard, User, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const navItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/parking-spaces", icon: Square, label: "Espacios" },
        { path: "/my-parking", icon: Car, label: "Mi Parqueo" },
        { path: "/payment", icon: CreditCard, label: "Pagos" },
        { path: "/profile", icon: User, label: "Perfil" },
    ]

    return (
        <div className="dashboard-layout min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside
                className={`sidebar ${sidebarOpen ? "open" : ""}`}
                style={{
                    transform: sidebarOpen ? "translateX(0)" : undefined,
                }}
            >
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <Car style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                        </div>
                        <span className="sidebar-logo-text">ParkEasy</span>
                    </div>
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <X style={{ width: "1.5rem", height: "1.5rem" }} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon style={{ width: "1.25rem", height: "1.25rem" }} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut style={{ width: "1.25rem", height: "1.25rem" }} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content">
                {/* Top bar */}
                <header className="topbar">
                    <div className="topbar-inner">
                        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                            <Menu style={{ width: "1.5rem", height: "1.5rem" }} />
                        </button>
                        <div className="topbar-user">
                            <div className="user-info">
                                <p className="user-name">{user?.name || "Usuario"}</p>
                                <p className="user-email">{user?.email || "email@example.com"}</p>
                            </div>
                            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
