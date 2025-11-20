"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Car, Lock, Mail } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement authentication logic
        console.log("Login:", { email, password })
        navigate("/dashboard")
    }

    return (
        <div className="auth-container login">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon primary">
                        <Car className="w-8 h-8 text-white" style={{ color: "white" }} />
                    </div>
                    <h1 className="auth-title">ParkEasy</h1>
                    <p className="auth-subtitle">Inicia sesión en tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="tu@email.com"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="remember-forgot">
                        <label className="checkbox-wrapper">
                            <input type="checkbox" className="form-checkbox" />
                            <span style={{ fontSize: "0.875rem", color: "var(--color-gray-600)" }}>Recordarme</span>
                        </label>
                        <a href="#" className="link">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Iniciar Sesión
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" className="link" style={{ fontWeight: 600 }}>
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}
