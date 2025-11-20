"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI, vehicleAPI } from "../services/api"

type User = {
    id: string
    name: string
    email: string
    phone: string
    vehicles: { id: string; plate: string; model: string; color?: string }[]
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string, phone: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token")
            if (token) {
                try {
                    const userData = await authAPI.getProfile()
                    const vehicles = await vehicleAPI.getVehicles()
                    setUser({ ...userData, vehicles })
                } catch (error) {
                    console.error("[v0] Error loading user:", error)
                    localStorage.removeItem("token")
                    localStorage.removeItem("parkingUser")
                }
            }
            setLoading(false)
        }
        loadUser()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login(email, password)
            localStorage.setItem("token", response.token)

            const userData = await authAPI.getProfile()
            const vehicles = await vehicleAPI.getVehicles()

            const fullUser: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                vehicles,
            }

            setUser(fullUser)
            localStorage.setItem("parkingUser", JSON.stringify(fullUser))
        } catch (error: any) {
            console.error("[v0] Login error:", error)
            throw new Error(error.response?.data?.message || "Error al iniciar sesión")
        }
    }

    const register = async (name: string, email: string, password: string, phone: string) => {
        try {
            console.log("[v0] Calling register API with:", { name, email, phone })
            const response = await authAPI.register(name, email, password, phone)
            console.log("[v0] Register response:", response)

            localStorage.setItem("token", response.token)

            const userData = await authAPI.getProfile()
            console.log("[v0] Profile data:", userData)

            const vehicles = await vehicleAPI.getVehicles()
            console.log("[v0] Vehicles data:", vehicles)

            const fullUser: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                vehicles,
            }

            setUser(fullUser)
            localStorage.setItem("parkingUser", JSON.stringify(fullUser))
        } catch (error: any) {
            console.error("[v0] Register error:", error)
            console.error("[v0] Error response:", error.response?.data)
            throw new Error(error.response?.data?.message || "Error al registrarse")
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("parkingUser")
        localStorage.removeItem("activeParking")
    }

    const refreshUser = async () => {
        try {
            const userData = await authAPI.getProfile()
            const vehicles = await vehicleAPI.getVehicles()
            const fullUser: User = { ...userData, vehicles }
            setUser(fullUser)
            localStorage.setItem("parkingUser", JSON.stringify(fullUser))
        } catch (error) {
            console.error("[v0] Error refreshing user:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}
