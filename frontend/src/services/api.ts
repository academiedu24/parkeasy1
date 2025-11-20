import axios from "axios"

const VITE_URL = "https://parkeasy1.onrender.com"

const api = axios.create({
    baseURL: VITE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Interceptor para agregar token en cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("parkingUser")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

// Auth endpoints
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post("/login", { email, password })
        return response.data
    },

    register: async (name: string, email: string, password: string, phone: string) => {
        const response = await api.post("/register", { name, email, password, phone })
        return response.data
    },

    getProfile: async () => {
        const response = await api.get("/profile")
        return response.data
    },

    updateProfile: async (data: { name?: string; phone?: string; email?: string }) => {
        const response = await api.put("/profile", data)
        return response.data
    },
}

// Parking spaces endpoints
export const parkingAPI = {
    getSpaces: async () => {
        const response = await api.get("/parking-spaces")
        return response.data
    },

    getSpaceById: async (id: string) => {
        const response = await api.get(`/parking-spaces/${id}`)
        return response.data
    },
}

// Parking sessions endpoints
export const sessionAPI = {
    startSession: async (spaceId: string, vehicleId: string) => {
        const response = await api.post("/parking-sessions/start", {
            parking_space_id: spaceId,
            vehicle_id: vehicleId,
        })
        return response.data
    },

    endSession: async (sessionId: string) => {
        const response = await api.post(`/parking-sessions/${sessionId}/end`)
        return response.data
    },

    getActiveSession: async () => {
        const response = await api.get("/parking-sessions/active")
        return response.data
    },

    getHistory: async () => {
        const response = await api.get("/parking-sessions/history")
        return response.data
    },
}

// Vehicles endpoints
export const vehicleAPI = {
    getVehicles: async () => {
        const response = await api.get("/vehicles")
        return response.data
    },

    addVehicle: async (plate: string, model: string, color?: string) => {
        const response = await api.post("/vehicles", { plate, model, color })
        return response.data
    },

    deleteVehicle: async (id: string) => {
        const response = await api.delete(`/vehicles/${id}`)
        return response.data
    },
}

// Payments endpoints
export const paymentAPI = {
    createPayment: async (sessionId: string, amount: number, paymentMethod: string) => {
        const response = await api.post("/payments", {
            session_id: sessionId,
            amount,
            payment_method: paymentMethod,
        })
        return response.data
    },

    getPaymentHistory: async () => {
        const response = await api.get("/payments/history")
        return response.data
    },
}

// Rates endpoint
export const rateAPI = {
    getCurrentRate: async () => {
        const response = await api.get("/rates/current")
        return response.data
    },
}

export default api
