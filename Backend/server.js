require("dotenv").config()
const express = require("express")
const cors = require("cors")
const pool = require("./database")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

var app = express()
app.use(express.json())
app.use(
    cors({
        origin: "*",
    }),
)

const PORT = process.env.PORT || 3000
const jwtSecret = process.env.JWT_SECRET || "your-secret-key-here"

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" })
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" })
        }
        req.user = user
        next()
    })
}

app.get("/", (req, res) => {
    res.send("ParkEasy Backend funcionando ...")
})

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()")
        res.json({
            success: true,
            message: "Database connected",
            timestamp: result.rows[0].now,
        })
    } catch (error) {
        console.error("[Backend] Database connection error:", error.message)
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        })
    }
})

app.get("/test-tables", async (req, res) => {
    try {
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
        res.json({
            success: true,
            tables: tables.rows.map((t) => t.table_name),
        })
    } catch (error) {
        console.error("[Backend] Tables check error:", error.message)
        res.status(500).json({
            success: false,
            message: "Failed to check tables",
            error: error.message,
        })
    }
})

app.get("/test-users-structure", async (req, res) => {
    try {
        const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `)
        res.json({
            success: true,
            columns: columns.rows,
        })
    } catch (error) {
        console.error("[Backend] Users structure check error:", error.message)
        res.status(500).json({
            success: false,
            message: "Failed to check users table structure",
            error: error.message,
        })
    }
})

// ============== AUTH ENDPOINTS ==============

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Usuario no encontrado" })
        }

        const userInfo = user.rows[0]

        const isMatch = await bcrypt.compare(password, userInfo.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" })
        }

        const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, jwtSecret, { expiresIn: "24h" })

        res.json({
            token,
            user: {
                id: userInfo.id,
                name: userInfo.full_name,
                email: userInfo.email,
                phone: userInfo.phone,
                createdAt: userInfo.created_at,
            },
        })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Register
app.post("/register", async (req, res) => {
    const { full_name, email, password, phone } = req.body

    try {
        console.log("[Backend] Register request received:", { full_name, email, phone })

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son requeridos" })
        }

        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "El email ya está registrado" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await pool.query(
            "INSERT INTO users (full_name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *",
            [full_name, email, hashedPassword, phone || null],
        )

        const userInfo = newUser.rows[0]
        console.log("[Backend] User created:", userInfo.id)

        const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, jwtSecret, { expiresIn: "24h" })

        res.json({
            token,
            user: {
                id: userInfo.id,
                full_name: userInfo.full_name,
                email: userInfo.email,
                phone: userInfo.phone,
                createdAt: userInfo.created_at,
            },
        })
    } catch (error) {
        console.error("[Backend] Register error:", error.message)
        console.error("[Backend] Error stack:", error.stack)
        res.status(500).json({ message: "Error del servidor: " + error.message })
    }
})

// Get Profile
app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await pool.query("SELECT id, full_name, email, phone, created_at FROM users WHERE id = $1", [
            req.user.id,
        ])

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        res.json(user.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Update Profile
app.put("/profile", authenticateToken, async (req, res) => {
    const { full_name, phone, email } = req.body

    try {
        const updatedUser = await pool.query(
            "UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), email = COALESCE($3, email) WHERE id = $4 RETURNING id, full_name, email, phone, created_at",
            [full_name, phone, email, req.user.id],
        )

        res.json(updatedUser.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// ============== PARKING SPACES ENDPOINTS ==============

// Get all parking spaces
app.get("/parking-spaces", authenticateToken, async (req, res) => {
    try {
        const spaces = await pool.query(`
            SELECT 
                ps.*,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM parking_sessions 
                        WHERE space_id = ps.id 
                        AND exit_time IS NULL
                    ) THEN 'occupied'
                    WHEN ps.status = 'available' THEN 'available'
                    ELSE ps.status
                END as status
            FROM parking_spaces ps
            ORDER BY ps.space_number
        `)

        res.json(spaces.rows)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Get parking space by ID
app.get("/parking-spaces/:id", authenticateToken, async (req, res) => {
    const { id } = req.params

    try {
        const space = await pool.query("SELECT * FROM parking_spaces WHERE id = $1", [id])

        if (space.rows.length === 0) {
            return res.status(404).json({ message: "Espacio no encontrado" })
        }

        res.json(space.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// ============== PARKING SESSIONS ENDPOINTS ==============

// Start parking session
app.post("/parking-sessions/start", authenticateToken, async (req, res) => {
    const { space_id, vehicle_id } = req.body

    try {
        // Verificar si el espacio está disponible
        const space = await pool.query("SELECT * FROM parking_spaces WHERE id = $1", [space_id])

        if (space.rows.length === 0) {
            return res.status(404).json({ message: "Espacio no encontrado" })
        }

        // Verificar si el usuario ya tiene una sesión activa
        const activeSession = await pool.query("SELECT * FROM parking_sessions WHERE user_id = $1 AND exit_time IS NULL", [
            req.user.id,
        ])

        if (activeSession.rows.length > 0) {
            return res.status(400).json({ message: "Ya tienes una sesión activa" })
        }

        // Verificar si el espacio está ocupado
        const occupiedSpace = await pool.query("SELECT * FROM parking_sessions WHERE space_id = $1 AND exit_time IS NULL", [
            space_id,
        ])

        if (occupiedSpace.rows.length > 0) {
            return res.status(400).json({ message: "Este espacio ya está ocupado" })
        }

        // Obtener la placa del vehículo
        const vehicle = await pool.query("SELECT license_plate FROM vehicles WHERE id = $1", [vehicle_id])

        if (vehicle.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" })
        }

        // Crear nueva sesión
        const newSession = await pool.query(
            "INSERT INTO parking_sessions (user_id, space_id, vehicle_id, license_plate, entry_time) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [req.user.id, space_id, vehicle_id, vehicle.rows[0].license_plate],
        )

        res.json(newSession.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// End parking session
app.post("/parking-sessions/:id/end", authenticateToken, async (req, res) => {
    const { id } = req.params

    try {
        const session = await pool.query("SELECT * FROM parking_sessions WHERE id = $1 AND user_id = $2", [id, req.user.id])

        if (session.rows.length === 0) {
            return res.status(404).json({ message: "Sesión no encontrada" })
        }

        if (session.rows[0].exit_time) {
            return res.status(400).json({ message: "Esta sesión ya ha terminado" })
        }

        // Obtener la tarifa actual
        const rate = await pool.query("SELECT rate_per_hour FROM pricing WHERE is_active = true LIMIT 1")
        const hourlyRate = rate.rows.length > 0 ? rate.rows[0].rate_per_hour : 2.5

        // Calcular el tiempo y costo
        const entryTime = new Date(session.rows[0].entry_time)
        const exitTime = new Date()
        const hours = Math.max((exitTime - entryTime) / (1000 * 60 * 60), 0.25) // Mínimo 15 minutos
        const totalCost = Number.parseFloat((hours * hourlyRate).toFixed(2))
        const durationMinutes = Math.ceil((exitTime - entryTime) / (1000 * 60))

        // Actualizar la sesión
        const updatedSession = await pool.query(
            "UPDATE parking_sessions SET exit_time = $1, total_cost = $2, duration_minutes = $3, status = 'completed' WHERE id = $4 RETURNING *",
            [exitTime, totalCost, durationMinutes, id],
        )

        res.json(updatedSession.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Get active session
app.get("/parking-sessions/active", authenticateToken, async (req, res) => {
    try {
        const session = await pool.query(
            `
            SELECT 
                ps.*,
                pspace.space_number,
                pspace.floor as location,
                v.license_plate as vehicle_plate,
                v.model as vehicle_model
            FROM parking_sessions ps
            JOIN parking_spaces pspace ON ps.space_id = pspace.id
            JOIN vehicles v ON ps.vehicle_id = v.id
            WHERE ps.user_id = $1 AND ps.exit_time IS NULL
            LIMIT 1
        `,
            [req.user.id],
        )

        if (session.rows.length === 0) {
            return res.json(null)
        }

        res.json(session.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Get parking history
app.get("/parking-sessions/history", authenticateToken, async (req, res) => {
    try {
        const history = await pool.query(
            `
            SELECT 
                ps.*,
                pspace.space_number,
                pspace.floor as location,
                v.license_plate as vehicle_plate,
                v.model as vehicle_model
            FROM parking_sessions ps
            JOIN parking_spaces pspace ON ps.space_id = pspace.id
            JOIN vehicles v ON ps.vehicle_id = v.id
            WHERE ps.user_id = $1 AND ps.exit_time IS NOT NULL
            ORDER BY ps.exit_time DESC
            LIMIT 20
        `,
            [req.user.id],
        )

        res.json(history.rows)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// ============== VEHICLES ENDPOINTS ==============

// Get user vehicles
app.get("/vehicles", authenticateToken, async (req, res) => {
    try {
        const vehicles = await pool.query("SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC", [
            req.user.id,
        ])

        res.json(vehicles.rows)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Add vehicle
app.post("/vehicles", authenticateToken, async (req, res) => {
    const { plate, brand, model, color } = req.body

    try {
        const newVehicle = await pool.query(
            "INSERT INTO vehicles (user_id, license_plate, brand, model, color) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.id, plate, brand, model, color],
        )

        res.json(newVehicle.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Delete vehicle
app.delete("/vehicles/:id", authenticateToken, async (req, res) => {
    const { id } = req.params

    try {
        const vehicle = await pool.query("DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING *", [
            id,
            req.user.id,
        ])

        if (vehicle.rows.length === 0) {
            return res.status(404).json({ message: "Vehículo no encontrado" })
        }

        res.json({ message: "Vehículo eliminado exitosamente" })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// ============== PAYMENTS ENDPOINTS ==============

// Create payment
app.post("/payments", authenticateToken, async (req, res) => {
    const { session_id, amount, payment_method, card_last_four } = req.body

    try {
        const newPayment = await pool.query(
            "INSERT INTO payments (user_id, session_id, amount, payment_method, card_last_four, paid_at, payment_status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *",
            [req.user.id, session_id, amount, payment_method, card_last_four || null, "completed"],
        )

        res.json(newPayment.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// Get payment history
app.get("/payments/history", authenticateToken, async (req, res) => {
    try {
        const payments = await pool.query(
            `
            SELECT 
                p.*,
                ps.entry_time,
                ps.exit_time,
                pspace.space_number
            FROM payments p
            JOIN parking_sessions ps ON p.session_id = ps.id
            JOIN parking_spaces pspace ON ps.space_id = pspace.id
            WHERE p.user_id = $1
            ORDER BY p.paid_at DESC
            LIMIT 20
        `,
            [req.user.id],
        )

        res.json(payments.rows)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

// ============== RATES ENDPOINT ==============

// Get current rate
app.get("/rates/current", authenticateToken, async (req, res) => {
    try {
        const rate = await pool.query("SELECT * FROM pricing WHERE is_active = true LIMIT 1")

        if (rate.rows.length === 0) {
            return res.json({ rate_per_hour: 2.5, currency: "USD" }) // Default rate
        }

        res.json(rate.rows[0])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Error del servidor" })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
