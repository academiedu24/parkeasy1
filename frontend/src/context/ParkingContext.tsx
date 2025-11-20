"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { parkingAPI, sessionAPI, rateAPI } from "../services/api"

export type ParkingSpace = {
    id: string
    space_number: string
    status: "available" | "occupied"
    floor?: string
    section?: string
}

export type ActiveParking = {
    sessionId: string
    spaceId: string
    spaceNumber: string
    vehicle: string
    vehicleId: string
    entryTime: string
}

export type ParkingHistory = {
    id: string
    date: string
    space: string
    duration: string
    cost: string
    entryTime: string
    exitTime: string
    paymentStatus: string
}

type ParkingContextType = {
    spaces: ParkingSpace[]
    activeParking: ActiveParking | null
    parkingHistory: ParkingHistory[]
    loading: boolean
    hourlyRate: number
    refreshSpaces: () => Promise<void>
    refreshActiveSession: () => Promise<void>
    refreshHistory: () => Promise<void>
    startParking: (spaceId: string, vehicleId: string, vehiclePlate: string) => Promise<void>
    endParking: () => Promise<{ duration: string; cost: number }>
    getAvailableCount: () => number
    getOccupiedCount: () => number
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined)

export function ParkingProvider({ children }: { children: ReactNode }) {
    const [spaces, setSpaces] = useState<ParkingSpace[]>([])
    const [activeParking, setActiveParking] = useState<ActiveParking | null>(null)
    const [parkingHistory, setParkingHistory] = useState<ParkingHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [hourlyRate, setHourlyRate] = useState(2.5)

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([refreshSpaces(), refreshActiveSession(), refreshHistory(), loadRate()])
            } catch (error) {
                console.error("[v0] Error loading parking data:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const loadRate = async () => {
        try {
            const rate = await rateAPI.getCurrentRate()
            setHourlyRate(rate.rate_per_hour)
        } catch (error) {
            console.error("[v0] Error loading rate:", error)
        }
    }

    const refreshSpaces = async () => {
        try {
            const spacesData = await parkingAPI.getSpaces()
            setSpaces(spacesData)
        } catch (error) {
            console.error("[v0] Error loading spaces:", error)
        }
    }

    const refreshActiveSession = async () => {
        try {
            const session = await sessionAPI.getActiveSession()
            if (session) {
                setActiveParking({
                    sessionId: session.id,
                    spaceId: session.parking_space_id,
                    spaceNumber: session.space_number,
                    vehicle: session.vehicle_plate,
                    vehicleId: session.vehicle_id,
                    entryTime: session.entry_time,
                })
            } else {
                setActiveParking(null)
            }
        } catch (error) {
            console.error("[v0] Error loading active session:", error)
            setActiveParking(null)
        }
    }

    const refreshHistory = async () => {
        try {
            const history = await sessionAPI.getHistory()
            const formattedHistory = history.map((session: any) => ({
                id: session.id,
                date: new Date(session.entry_time).toLocaleDateString("es-CO"),
                space: session.space_number,
                duration: session.duration || "N/A",
                cost: session.total_cost ? `$${session.total_cost}` : "Pendiente",
                entryTime: new Date(session.entry_time).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                exitTime: session.exit_time
                    ? new Date(session.exit_time).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "Activo",
                paymentStatus: session.payment_status || "pending",
            }))
            setParkingHistory(formattedHistory)
        } catch (error) {
            console.error("[v0] Error loading history:", error)
        }
    }

    const startParking = async (spaceId: string, vehicleId: string, vehiclePlate: string) => {
        try {
            const session = await sessionAPI.startSession(spaceId, vehicleId)

            const space = spaces.find((s) => s.id === spaceId)

            const newActiveParking: ActiveParking = {
                sessionId: session.id,
                spaceId,
                spaceNumber: space?.space_number || "",
                vehicle: vehiclePlate,
                vehicleId,
                entryTime: session.entry_time,
            }

            setActiveParking(newActiveParking)
            await refreshSpaces()
        } catch (error: any) {
            console.error("[v0] Error starting parking:", error)
            throw new Error(error.response?.data?.message || "Error al iniciar sesión de parqueo")
        }
    }

    const endParking = async () => {
        if (!activeParking) return { duration: "0m", cost: 0 }

        try {
            const result = await sessionAPI.endSession(activeParking.sessionId)

            setActiveParking(null)
            await refreshSpaces()
            await refreshHistory()

            return {
                duration: result.duration || "0m",
                cost: result.total_cost || 0,
            }
        } catch (error: any) {
            console.error("[v0] Error ending parking:", error)
            throw new Error(error.response?.data?.message || "Error al finalizar sesión")
        }
    }

    const getAvailableCount = () => spaces.filter((s) => s.status === "available").length
    const getOccupiedCount = () => spaces.filter((s) => s.status === "occupied").length

    return (
        <ParkingContext.Provider
            value={{
                spaces,
                activeParking,
                parkingHistory,
                loading,
                hourlyRate,
                refreshSpaces,
                refreshActiveSession,
                refreshHistory,
                startParking,
                endParking,
                getAvailableCount,
                getOccupiedCount,
            }}
        >
            {children}
        </ParkingContext.Provider>
    )
}

export function useParking() {
    const context = useContext(ParkingContext)
    if (!context) {
        throw new Error("useParking must be used within ParkingProvider")
    }
    return context
}
