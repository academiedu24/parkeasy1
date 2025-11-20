"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type ParkingSpace = {
    id: string
    number: string
    status: "available" | "occupied"
    vehicle?: string
    userId?: string
    entryTime?: string
}

export type ActiveParking = {
    spaceId: string
    spaceNumber: string
    vehicle: string
    entryTime: string
    userId: string
}

export type ParkingHistory = {
    id: string
    date: string
    space: string
    duration: string
    cost: string
    entryTime: string
    exitTime: string
}

type ParkingContextType = {
    spaces: ParkingSpace[]
    activeParking: ActiveParking | null
    parkingHistory: ParkingHistory[]
    startParking: (spaceId: string, vehicle: string, userId: string) => void
    endParking: () => { duration: string; cost: number }
    getAvailableCount: () => number
    getOccupiedCount: () => number
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined)

const initialSpaces: ParkingSpace[] = [
    { id: "1", number: "A-01", status: "available" },
    { id: "2", number: "A-02", status: "available" },
    { id: "3", number: "A-03", status: "available" },
    { id: "4", number: "A-04", status: "available" },
    { id: "5", number: "A-05", status: "available" },
]

export function ParkingProvider({ children }: { children: ReactNode }) {
    const [spaces, setSpaces] = useState<ParkingSpace[]>(initialSpaces)
    const [activeParking, setActiveParking] = useState<ActiveParking | null>(null)
    const [parkingHistory, setParkingHistory] = useState<ParkingHistory[]>([])

    useEffect(() => {
        const savedSpaces = localStorage.getItem("parkingSpaces")
        const savedActive = localStorage.getItem("activeParking")
        const savedHistory = localStorage.getItem("parkingHistory")

        if (savedSpaces) setSpaces(JSON.parse(savedSpaces))
        if (savedActive) setActiveParking(JSON.parse(savedActive))
        if (savedHistory) setParkingHistory(JSON.parse(savedHistory))
    }, [])

    useEffect(() => {
        localStorage.setItem("parkingSpaces", JSON.stringify(spaces))
    }, [spaces])

    const startParking = (spaceId: string, vehicle: string, userId: string) => {
        const space = spaces.find((s) => s.id === spaceId)
        if (!space || space.status !== "available") return

        const now = new Date()
        const entryTime = now.toISOString()

        const newActiveParking: ActiveParking = {
            spaceId,
            spaceNumber: space.number,
            vehicle,
            entryTime,
            userId,
        }

        setActiveParking(newActiveParking)
        localStorage.setItem("activeParking", JSON.stringify(newActiveParking))

        setSpaces((prev) =>
            prev.map((s) => (s.id === spaceId ? { ...s, status: "occupied", vehicle, userId, entryTime } : s)),
        )
    }

    const endParking = () => {
        if (!activeParking) return { duration: "0m", cost: 0 }

        const entry = new Date(activeParking.entryTime)
        const exit = new Date()
        const durationMs = exit.getTime() - entry.getTime()
        const hours = Math.floor(durationMs / (1000 * 60 * 60))
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

        const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        const cost = Math.max(2, Math.ceil((durationMs / (1000 * 60 * 60)) * 2)) // $2 per hour, minimum $2

        const historyEntry: ParkingHistory = {
            id: Date.now().toString(),
            date: exit.toLocaleDateString("es-CO"),
            space: activeParking.spaceNumber,
            duration,
            cost: `$${cost.toFixed(2)}`,
            entryTime: entry.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
            exitTime: exit.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        }

        setParkingHistory((prev) => [historyEntry, ...prev])
        localStorage.setItem("parkingHistory", JSON.stringify([historyEntry, ...parkingHistory]))

        setSpaces((prev) =>
            prev.map((s) =>
                s.id === activeParking.spaceId
                    ? { ...s, status: "available", vehicle: undefined, userId: undefined, entryTime: undefined }
                    : s,
            ),
        )

        setActiveParking(null)
        localStorage.removeItem("activeParking")

        return { duration, cost }
    }

    const getAvailableCount = () => spaces.filter((s) => s.status === "available").length
    const getOccupiedCount = () => spaces.filter((s) => s.status === "occupied").length

    return (
        <ParkingContext.Provider
            value={{
                spaces,
                activeParking,
                parkingHistory,
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
