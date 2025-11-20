"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Car, Lock, Mail, User, Phone } from "lucide-react"

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement registration logic
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden")
            return
        }
        console.log("Register:", formData)
        navigate("/login")
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

                    <button type="submit" className="btn btn-secondary">
                        Registrarse
                    </button>
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
