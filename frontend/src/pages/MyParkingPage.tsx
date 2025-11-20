"use client"

import { Clock, MapPin, DollarSign, Car } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useParking } from "../context/ParkingContext"

export default function MyParkingPage() {
    const navigate = useNavigate()
    const { activeParking, parkingHistory, endParking } = useParking()
    const [duration, setDuration] = useState("0m")
    const [currentCost, setCurrentCost] = useState("$0.00")

    useEffect(() => {
        if (!activeParking) return

        const updateTime = () => {
            const entry = new Date(activeParking.entryTime)
            const now = new Date()
            const durationMs = now.getTime() - entry.getTime()
            const hours = Math.floor(durationMs / (1000 * 60 * 60))
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

            setDuration(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)

            const cost = Math.max(2, Math.ceil((durationMs / (1000 * 60 * 60)) * 2))
            setCurrentCost(`$${cost.toFixed(2)}`)
        }

        updateTime()
        const interval = setInterval(updateTime, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [activeParking])

    const handleEndSession = async () => {
        const result = await endParking()
        navigate("/payment", { state: { duration: result.duration, cost: result.cost } })
    }

    const entryTime = activeParking
        ? new Date(activeParking.entryTime).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
        : "--:--"

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Mi Parqueo</h1>
                <p className="page-subtitle">Gestiona tu sesión de parqueo actual</p>
            </div>

            {activeParking ? (
                <div className="active-parking-card">
                    <div className="active-parking-header">
                        <h2 className="active-parking-title">Sesión Activa</h2>
                        <div className="status-badge">
                            <span>En Progreso</span>
                        </div>
                    </div>

                    <div className="parking-info-grid">
                        <div className="parking-info-item">
                            <div className="info-header">
                                <MapPin style={{ width: "1.5rem", height: "1.5rem" }} />
                                <span>Ubicación</span>
                            </div>
                            <p className="info-value">{activeParking.spaceNumber}</p>
                            <p className="info-subtitle">Espacio asignado</p>
                        </div>

                        <div className="parking-info-item">
                            <div className="info-header">
                                <Car style={{ width: "1.5rem", height: "1.5rem" }} />
                                <span>Vehículo</span>
                            </div>
                            <p className="info-value">{activeParking.vehicle}</p>
                            <p className="info-subtitle">Placa registrada</p>
                        </div>

                        <div className="parking-info-item">
                            <div className="info-header">
                                <Clock style={{ width: "1.5rem", height: "1.5rem" }} />
                                <span>Tiempo Transcurrido</span>
                            </div>
                            <p className="info-value">{duration}</p>
                            <p className="info-subtitle">Desde {entryTime}</p>
                        </div>

                        <div className="parking-info-item">
                            <div className="info-header">
                                <DollarSign style={{ width: "1.5rem", height: "1.5rem" }} />
                                <span>Costo Actual</span>
                            </div>
                            <p className="info-value">{currentCost}</p>
                            <p className="info-subtitle">$2.00 / hora</p>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={handleEndSession}>
                        Finalizar Sesión y Pagar
                    </button>
                </div>
            ) : (
                <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                    <Car style={{ width: "4rem", height: "4rem", margin: "0 auto", color: "var(--color-gray-400)" }} />
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1rem", color: "var(--color-gray-700)" }}>
                        No tienes una sesión activa
                    </h3>
                    <p style={{ color: "var(--color-gray-500)", marginTop: "0.5rem" }}>
                        Reserva un espacio desde la página de Espacios
                    </p>
                    <button
                        onClick={() => navigate("/parking-spaces")}
                        className="btn btn-primary"
                        style={{ marginTop: "1.5rem", width: "auto", padding: "0.75rem 2rem" }}
                    >
                        Ver Espacios Disponibles
                    </button>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Historial de Parqueos</h2>
                </div>
                <div className="activity-list">
                    {parkingHistory.length > 0 ? (
                        parkingHistory.map((session, index) => (
                            <div key={session.id || index} className="activity-item">
                                <div className="activity-info">
                                    <div className="stat-icon blue" style={{ padding: "0.75rem" }}>
                                        <Car style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
                                    </div>
                                    <div>
                                        <p className="activity-text">Espacio {session.space}</p>
                                        <p className="activity-subtext">{session.date}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p className="activity-text">{session.cost}</p>
                                    <p className="activity-subtext">{session.duration}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--color-gray-500)", padding: "2rem" }}>
                            No hay historial de parqueos
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
