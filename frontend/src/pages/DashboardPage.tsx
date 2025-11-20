import { Car, CheckCircle, Clock } from "lucide-react"
import { useParking } from "../context/ParkingContext"

export default function DashboardPage() {
    const { getAvailableCount, getOccupiedCount, parkingHistory } = useParking()

    const stats = [
        {
            icon: Car,
            label: "Espacios Totales",
            value: "5",
            color: "blue",
        },
        {
            icon: CheckCircle,
            label: "Espacios Disponibles",
            value: getAvailableCount().toString(),
            color: "green",
        },
        {
            icon: Clock,
            label: "Espacios Ocupados",
            value: getOccupiedCount().toString(),
            color: "orange",
        },
    ]

    const recentActivity = parkingHistory.slice(0, 4).map((session, index) => ({
        id: index + 1,
        action: "Salida",
        space: session.space,
        plate: "Completado",
        time: session.exitTime,
    }))

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Bienvenido al sistema de gestión de parqueadero</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 grid-md-2 grid-lg-4">
                {stats.map((stat, index) => (
                    <div key={index} className="card stat-card">
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                        <div className={`stat-icon ${stat.color}`}>
                            <stat.icon style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Actividad Reciente</h2>
                </div>
                <div className="activity-list">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-info">
                                    <div className={`activity-dot orange`} />
                                    <div>
                                        <p className="activity-text">
                                            {activity.action} - Espacio {activity.space}
                                        </p>
                                        <p className="activity-subtext">{activity.plate}</p>
                                    </div>
                                </div>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--color-gray-500)", padding: "2rem" }}>
                            No hay actividad reciente
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
