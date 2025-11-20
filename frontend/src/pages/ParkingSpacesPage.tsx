"use client"

import { useState } from "react"
import { Search } from "lucide-react"

type ParkingSpace = {
    id: string
    number: string
    floor: string
    status: "available" | "occupied" | "reserved"
    vehicle?: string
}

export default function ParkingSpacesPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const parkingSpaces: ParkingSpace[] = [
        { id: "1", number: "A-01", floor: "Piso 1", status: "occupied", vehicle: "ABC-123" },
        { id: "2", number: "A-02", floor: "Piso 1", status: "available" },
        { id: "3", number: "A-03", floor: "Piso 1", status: "available" },
        { id: "4", number: "A-04", floor: "Piso 1", status: "reserved" },
        { id: "5", number: "B-01", floor: "Piso 2", status: "occupied", vehicle: "XYZ-789" },
        { id: "6", number: "B-02", floor: "Piso 2", status: "available" },
        { id: "7", number: "B-03", floor: "Piso 2", status: "available" },
        { id: "8", number: "B-04", floor: "Piso 2", status: "available" },
        { id: "9", number: "C-01", floor: "Piso 3", status: "available" },
        { id: "10", number: "C-02", floor: "Piso 3", status: "occupied", vehicle: "DEF-456" },
        { id: "11", number: "C-03", floor: "Piso 3", status: "available" },
        { id: "12", number: "C-04", floor: "Piso 3", status: "available" },
    ]

    const filteredSpaces = parkingSpaces.filter(
        (space) =>
            space.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            space.floor.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "green"
            case "occupied":
                return "red"
            case "reserved":
                return "yellow"
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
            case "reserved":
                return "Reservado"
            default:
                return status
        }
    }

    const availableCount = parkingSpaces.filter((s) => s.status === "available").length
    const occupiedCount = parkingSpaces.filter((s) => s.status === "occupied").length
    const reservedCount = parkingSpaces.filter((s) => s.status === "reserved").length

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
                    <p className="summary-label yellow">Reservados</p>
                    <p className="summary-value yellow">{reservedCount}</p>
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
                        <p className="space-number">{space.number}</p>
                        <p className="space-floor">{space.floor}</p>
                        <span className="space-badge">{getStatusText(space.status)}</span>
                        {space.vehicle && <p className="space-vehicle">Placa: {space.vehicle}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}
