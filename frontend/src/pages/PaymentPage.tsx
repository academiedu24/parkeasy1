"use client"

import type React from "react"

import { useState } from "react"
import { CreditCard, Calendar, Lock, DollarSign } from "lucide-react"

export default function PaymentPage() {
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentData({ ...paymentData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Payment:", paymentData)
        alert("Pago procesado exitosamente!")
    }

    return (
        <div className="space-y-6">
            <div className="page-header">
                <h1 className="page-title">Realizar Pago</h1>
                <p className="page-subtitle">Completa tu pago de forma segura</p>
            </div>

            <div className="payment-container">
                <div className="payment-form-section">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Información de Pago</h2>
                        </div>
                        <div className="card-content">
                            <form onSubmit={handleSubmit} className="form">
                                <div className="form-group">
                                    <label className="form-label">Número de Tarjeta</label>
                                    <div className="input-wrapper">
                                        <CreditCard className="input-icon" />
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={paymentData.cardNumber}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Nombre en la Tarjeta</label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        value={paymentData.cardName}
                                        onChange={handleChange}
                                        className="form-input"
                                        style={{ paddingLeft: "1rem" }}
                                        placeholder="JUAN PEREZ"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2">
                                    <div className="form-group">
                                        <label className="form-label">Fecha de Expiración</label>
                                        <div className="input-wrapper">
                                            <Calendar className="input-icon" />
                                            <input
                                                type="text"
                                                name="expiryDate"
                                                value={paymentData.expiryDate}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="MM/AA"
                                                maxLength={5}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">CVV</label>
                                        <div className="input-wrapper">
                                            <Lock className="input-icon" />
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentData.cvv}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="123"
                                                maxLength={4}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="secure-badge">
                                    <div className="secure-header">
                                        <Lock style={{ width: "1.25rem", height: "1.25rem" }} />
                                        <span>Pago Seguro</span>
                                    </div>
                                    <p className="secure-text">Tus datos de pago están protegidos con encriptación SSL de 256 bits.</p>
                                </div>

                                <button type="submit" className="btn btn-primary">
                                    Procesar Pago
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="payment-summary-section">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Resumen de Pago</h2>
                        </div>
                        <div className="card-content">
                            <div className="summary-items">
                                <div className="summary-row">
                                    <span>Espacio:</span>
                                    <span className="summary-row-value">A-12</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tiempo:</span>
                                    <span className="summary-row-value">2h 15m</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tarifa por hora:</span>
                                    <span className="summary-row-value">$2.00</span>
                                </div>
                                <div className="summary-row summary-divider">
                                    <span>Subtotal:</span>
                                    <span className="summary-row-value">$4.50</span>
                                </div>
                                <div className="summary-row">
                                    <span>IVA (19%):</span>
                                    <span className="summary-row-value">$0.86</span>
                                </div>
                            </div>

                            <div className="summary-total">
                                <span className="total-label">Total:</span>
                                <div className="total-amount">
                                    <DollarSign style={{ width: "1.5rem", height: "1.5rem", color: "var(--color-secondary)" }} />
                                    <span className="total-value">5.36</span>
                                </div>
                            </div>

                            <div className="terms-notice">
                                <p>Al procesar el pago, aceptas nuestros términos y condiciones de servicio.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
