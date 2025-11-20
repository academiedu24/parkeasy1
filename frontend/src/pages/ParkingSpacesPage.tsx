"use client"

import { useState } from "react"
import { Search, CarIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useParking } from "../context/ParkingContext"
import { useAuth } from "../context/AuthContext"

export default function ParkingSpacesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
    const [vehiclePlate, setVehiclePlate] = useState("")
    const navigate = useNavigate()

    const { spaces, activeParking, startParking, getAvailableCount, getOccupiedCount } = useParking()
    const { user } = useAuth()

    const filteredSpaces = spaces.filter((space) => {
        const label = ((space as any).number ?? space.id).toString().toLowerCase()
        return label.includes(searchTerm.toLowerCase())
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "green"
            case "occupied":
                return "red"
            default:
                return "gray"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "available":
                return "Disponible"
            case "occupied":
                return "Ocupado"
            default:
                return status
        }
    }

    const handleStartParking = (spaceId: string) => {
        if (!user) return

        if (activeParking) {
            alert("Ya tienes una sesión de parqueo activa")
            return
        }

        const defaultVehicle = user.vehicles[0]?.plate || ""
        setVehiclePlate(defaultVehicle)
        setSelectedSpace(spaceId)
    }

    const confirmStartParking = () => {
        if (!selectedSpace || !user || !vehiclePlate.trim()) {
            alert("Por favor ingresa una placa de vehículo")
            return
        }

        startParking(selectedSpace, vehiclePlate, user.id)
        setSelectedSpace(null)
        setVehiclePlate("")
        navigate("/my-parking")
    }

    const availableCount = getAvailableCount()
    const occupiedCount = getOccupiedCount()

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Espacios de Parqueo</h1>
                <p className="page-subtitle">Consulta la disponibilidad en tiempo real</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 grid-md-3">
                <div className="summary-card green">
                    <p className="summary-label green">Disponibles</p>
                    <p className="summary-value green">{availableCount}</p>
                </div>
                <div className="summary-card red">
                    <p className="summary-label red">Ocupados</p>
                    <p className="summary-value red">{occupiedCount}</p>
                </div>
                <div className="summary-card yellow">
                    <p className="summary-label yellow">Total Espacios</p>
                    <p className="summary-value yellow">5</p>
                </div>
            </div>

            {/* Search */}
            <div className="card">
                <div className="card-content">
                    <div className="search-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            placeholder="Buscar por número o piso..."
                        />
                    </div>
                </div>
            </div>

            {/* Parking Spaces Grid */}
            <div className="grid grid-cols-2 grid-md-3 grid-lg-4">
                {filteredSpaces.map((space) => (
                    <div key={space.id} className={`space-card ${getStatusColor(space.status)}`}>
                        <p className="space-number">{(space as any).number ?? space.id}</p>
                        <span className="space-badge">{getStatusText(space.status)}</span>
                        {(space as any).vehicle && <p className="space-vehicle">Placa: {(space as any).vehicle}</p>}
                        {space.status === "available" && !activeParking && (
                            <button
                                onClick={() => handleStartParking(space.id)}
                                className="btn btn-primary"
                                style={{ marginTop: "0.5rem", padding: "0.5rem", fontSize: "0.75rem" }}
                            >
                                Reservar
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {selectedSpace && (
                <div className="modal-backdrop" onClick={() => setSelectedSpace(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Iniciar Sesión de Parqueo</h3>
                        <div className="form-group">
                            <label className="form-label">Placa del Vehículo</label>
                            <div className="input-wrapper">
                                <CarIcon className="input-icon" />
                                <input
                                    type="text"
                                    value={vehiclePlate}
                                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                                    className="form-input"
                                    placeholder="ABC-123"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                            <button
                                onClick={() => setSelectedSpace(null)}
                                className="btn"
                                style={{ flex: 1, background: "var(--color-gray-200)", color: "var(--color-gray-700)" }}
                            >
                                Cancelar
                            </button>
                            <button onClick={confirmStartParking} className="btn btn-primary" style={{ flex: 1 }}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
