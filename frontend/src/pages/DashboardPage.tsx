import { Car, DollarSign, Clock, CheckCircle } from "lucide-react"

export default function DashboardPage() {
    const stats = [
        {
            icon: Car,
            label: "Espacios Totales",
            value: "120",
            color: "blue",
        },
        {
            icon: CheckCircle,
            label: "Espacios Disponibles",
            value: "45",
            color: "green",
        },
        {
            icon: Clock,
            label: "Espacios Ocupados",
            value: "75",
            color: "orange",
        },
        {
            icon: DollarSign,
            label: "Ingresos Hoy",
            value: "$1,250",
            color: "purple",
        },
    ]

    const recentActivity = [
        { id: 1, action: "Entrada", space: "A-12", plate: "ABC-123", time: "10:30 AM" },
        { id: 2, action: "Salida", space: "B-05", plate: "XYZ-789", time: "10:15 AM" },
        { id: 3, action: "Entrada", space: "C-08", plate: "DEF-456", time: "09:45 AM" },
        { id: 4, action: "Salida", space: "A-03", plate: "GHI-012", time: "09:20 AM" },
    ]

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
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-info">
                                <div className={`activity-dot ${activity.action === "Entrada" ? "green" : "orange"}`} />
                                <div>
                                    <p className="activity-text">
                                        {activity.action} - Espacio {activity.space}
                                    </p>
                                    <p className="activity-subtext">Placa: {activity.plate}</p>
                                </div>
                            </div>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
