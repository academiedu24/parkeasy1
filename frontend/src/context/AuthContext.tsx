"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
    id: string
    name: string
    email: string
    phone: string
    vehicles: { plate: string; model: string }[]
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string, phone: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const savedUser = localStorage.getItem("parkingUser")
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const login = async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const userData: User = {
            id: "1",
            name: "Usuario Demo",
            email,
            phone: "+57 300 123 4567",
            vehicles: [{ plate: "ABC-123", model: "Toyota Corolla 2020" }],
        }

        setUser(userData)
        localStorage.setItem("parkingUser", JSON.stringify(userData))
    }

    const register = async (name: string, email: string, password: string, phone: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const userData: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            phone,
            vehicles: [],
        }

        setUser(userData)
        localStorage.setItem("parkingUser", JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("parkingUser")
        localStorage.removeItem("activeParking")
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
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
