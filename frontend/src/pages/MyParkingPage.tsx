import { Clock, MapPin, DollarSign, Car } from "lucide-react"

export default function MyParkingPage() {
    // Simulated active parking session
    const activeParking = {
        space: "A-12",
        floor: "Piso 1",
        vehicle: "ABC-123",
        entryTime: "10:30 AM",
        duration: "2h 15m",
        currentCost: "$4.50",
    }

    const parkingHistory = [
        { id: 1, date: "2025-01-19", space: "B-05", duration: "3h 20m", cost: "$6.00" },
        { id: 2, date: "2025-01-18", space: "A-08", duration: "1h 45m", cost: "$3.50" },
        { id: 3, date: "2025-01-17", space: "C-12", duration: "4h 10m", cost: "$7.50" },
        { id: 4, date: "2025-01-16", space: "A-03", duration: "2h 30m", cost: "$5.00" },
    ]

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Mi Parqueo</h1>
                <p className="page-subtitle">Gestiona tu sesión de parqueo actual</p>
            </div>

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
                        <p className="info-value">{activeParking.space}</p>
                        <p className="info-subtitle">{activeParking.floor}</p>
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
                        <p className="info-value">{activeParking.duration}</p>
                        <p className="info-subtitle">Desde {activeParking.entryTime}</p>
                    </div>

                    <div className="parking-info-item">
                        <div className="info-header">
                            <DollarSign style={{ width: "1.5rem", height: "1.5rem" }} />
                            <span>Costo Actual</span>
                        </div>
                        <p className="info-value">{activeParking.currentCost}</p>
                        <p className="info-subtitle">$2.00 / hora</p>
                    </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
                    Finalizar Sesión y Pagar
                </button>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Historial de Parqueos</h2>
                </div>
                <div className="activity-list">
                    {parkingHistory.map((session) => (
                        <div key={session.id} className="activity-item">
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
                    ))}
                </div>
            </div>
        </div>
    )
}
