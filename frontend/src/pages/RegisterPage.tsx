"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Car, Lock, Mail, User, Phone, Loader2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { register } = useAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setLoading(true)
        try {
            console.log("[v0] Attempting register with:", { name: formData.name, email: formData.email })
            await register(formData.name, formData.email, formData.password, formData.phone)
            navigate("/dashboard")
        } catch (err: any) {
            console.error("[v0] Register error:", err)
            setError(err.message || "Error al registrarse. Intenta de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container register">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon secondary">
                        <Car className="w-8 h-8" style={{ color: "white" }} />
                    </div>
                    <h1 className="auth-title">ParkEasy</h1>
                    <p className="auth-subtitle">Crea tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label className="form-label">Nombre completo</label>
                        <div className="input-wrapper">
                            <User className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input secondary"
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input secondary"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <div className="input-wrapper">
                            <Phone className="input-icon" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input secondary"
                                placeholder="+57 300 123 4567"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input secondary"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input secondary"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-secondary" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" style={{ width: "1rem", height: "1rem" }} />
                                Registrando...
                            </>
                        ) : (
                            "Registrarse"
                        )}
                    </button>

                    {error && <p style={{ color: "var(--color-red-600)", fontSize: "0.875rem", marginTop: "0.5rem" }}>{error}</p>}
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="link secondary" style={{ fontWeight: 600 }}>
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}
