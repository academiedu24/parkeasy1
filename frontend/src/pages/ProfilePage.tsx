"use client"

import { User, Mail, Phone, Car, Calendar, Edit2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) return null

    const userProfile = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberSince: "Enero 2025",
        totalVisits: 0,
        totalSpent: "$0.00",
    }

    const registeredVehicles = user.vehicles

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Mi Perfil</h1>
                <p className="page-subtitle">Gestiona tu información personal</p>
            </div>

            <div className="profile-container">
                <div className="profile-card-section">
                    <div className="card">
                        <div className="card-content">
                            <div className="profile-avatar-section">
                                <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
                                <h2 className="profile-name">{userProfile.name}</h2>
                                <p className="profile-email">{userProfile.email}</p>

                                <div className="profile-stats">
                                    <div className="profile-stat-item">
                                        <span className="profile-stat-label">Miembro desde</span>
                                        <span className="profile-stat-value">{userProfile.memberSince}</span>
                                    </div>
                                    <div className="profile-stat-item">
                                        <span className="profile-stat-label">Total visitas</span>
                                        <span className="profile-stat-value">{userProfile.totalVisits}</span>
                                    </div>
                                    <div className="profile-stat-item">
                                        <span className="profile-stat-label">Total gastado</span>
                                        <span className="profile-stat-value" style={{ color: "var(--color-secondary)" }}>
                                            {userProfile.totalSpent}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-details-section">
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <div className="card-header">
                            <h2 className="card-title">Información Personal</h2>
                            <button className="edit-btn">
                                <Edit2 style={{ width: "1rem", height: "1rem" }} />
                                Editar
                            </button>
                        </div>

                        <div className="card-content">
                            <div className="info-items">
                                <div className="info-item">
                                    <User style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-gray-600)" }} />
                                    <div>
                                        <p className="info-item-label">Nombre Completo</p>
                                        <p className="info-item-value">{userProfile.name}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <Mail style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-gray-600)" }} />
                                    <div>
                                        <p className="info-item-label">Correo Electrónico</p>
                                        <p className="info-item-value">{userProfile.email}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <Phone style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-gray-600)" }} />
                                    <div>
                                        <p className="info-item-label">Teléfono</p>
                                        <p className="info-item-value">{userProfile.phone}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <Calendar style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-gray-600)" }} />
                                    <div>
                                        <p className="info-item-label">Miembro desde</p>
                                        <p className="info-item-value">{userProfile.memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Vehículos Registrados</h2>
                            <button
                                className="btn btn-primary"
                                style={{ padding: "0.5rem 1rem", width: "auto", fontSize: "0.875rem" }}
                            >
                                + Agregar
                            </button>
                        </div>

                        <div className="card-content">
                            <div className="vehicles-list">
                                {registeredVehicles.length > 0 ? (
                                    registeredVehicles.map((vehicle, index) => (
                                        <div key={index} className="vehicle-card">
                                            <div className="vehicle-info">
                                                <div className="stat-icon blue">
                                                    <Car style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                                                </div>
                                                <div>
                                                    <p className="vehicle-plate">{vehicle.plate}</p>
                                                    <p className="vehicle-details">{vehicle.model}</p>
                                                </div>
                                            </div>
                                            <button className="delete-btn">Eliminar</button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: "center", color: "var(--color-gray-500)", padding: "2rem" }}>
                                        No hay vehículos registrados
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
