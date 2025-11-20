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
                name: userInfo.name,
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
    const { name, email, password, phone } = req.body

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "El email ya está registrado" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, phone],
        )

        const userInfo = newUser.rows[0]

        const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, jwtSecret, { expiresIn: "24h" })

        res.json({
            token,
            user: {
                id: userInfo.id,
                name: userInfo.name,
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

// Get Profile
app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await pool.query("SELECT id, name, email, phone, created_at FROM users WHERE id = $1", [req.user.id])

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
    const { name, phone, email } = req.body

    try {
        const updatedUser = await pool.query(
            "UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), email = COALESCE($3, email) WHERE id = $4 RETURNING id, name, email, phone, created_at",
            [name, phone, email, req.user.id],
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
                        WHERE parking_space_id = ps.id 
                        AND end_time IS NULL
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
    const { parking_space_id, vehicle_id } = req.body

    try {
        // Verificar si el espacio está disponible
        const space = await pool.query("SELECT * FROM parking_spaces WHERE id = $1", [parking_space_id])

        if (space.rows.length === 0) {
            return res.status(404).json({ message: "Espacio no encontrado" })
        }

        // Verificar si el usuario ya tiene una sesión activa
        const activeSession = await pool.query("SELECT * FROM parking_sessions WHERE user_id = $1 AND end_time IS NULL", [
            req.user.id,
        ])

        if (activeSession.rows.length > 0) {
            return res.status(400).json({ message: "Ya tienes una sesión activa" })
        }

        // Verificar si el espacio está ocupado
        const occupiedSpace = await pool.query(
            "SELECT * FROM parking_sessions WHERE parking_space_id = $1 AND end_time IS NULL",
            [parking_space_id],
        )

        if (occupiedSpace.rows.length > 0) {
            return res.status(400).json({ message: "Este espacio ya está ocupado" })
        }

        // Crear nueva sesión
        const newSession = await pool.query(
            "INSERT INTO parking_sessions (user_id, parking_space_id, vehicle_id, start_time) VALUES ($1, $2, $3, NOW()) RETURNING *",
            [req.user.id, parking_space_id, vehicle_id],
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

        if (session.rows[0].end_time) {
            return res.status(400).json({ message: "Esta sesión ya ha terminado" })
        }

        // Obtener la tarifa actual
        const rate = await pool.query("SELECT hourly_rate FROM rates WHERE is_active = true LIMIT 1")
        const hourlyRate = rate.rows.length > 0 ? rate.rows[0].hourly_rate : 2.5

        // Calcular el tiempo y costo
        const startTime = new Date(session.rows[0].start_time)
        const endTime = new Date()
        const hours = Math.max((endTime - startTime) / (1000 * 60 * 60), 0.25) // Mínimo 15 minutos
        const totalCost = Number.parseFloat((hours * hourlyRate).toFixed(2))

        // Actualizar la sesión
        const updatedSession = await pool.query(
            "UPDATE parking_sessions SET end_time = $1, total_cost = $2 WHERE id = $3 RETURNING *",
            [endTime, totalCost, id],
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
                pspace.location,
                v.plate as vehicle_plate,
                v.model as vehicle_model
            FROM parking_sessions ps
            JOIN parking_spaces pspace ON ps.parking_space_id = pspace.id
            JOIN vehicles v ON ps.vehicle_id = v.id
            WHERE ps.user_id = $1 AND ps.end_time IS NULL
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
                pspace.location,
                v.plate as vehicle_plate,
                v.model as vehicle_model
            FROM parking_sessions ps
            JOIN parking_spaces pspace ON ps.parking_space_id = pspace.id
            JOIN vehicles v ON ps.vehicle_id = v.id
            WHERE ps.user_id = $1 AND ps.end_time IS NOT NULL
            ORDER BY ps.end_time DESC
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
    const { plate, model, color } = req.body

    try {
        const newVehicle = await pool.query(
            "INSERT INTO vehicles (user_id, plate, model, color) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.user.id, plate, model, color],
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
    const { session_id, amount, payment_method } = req.body

    try {
        const newPayment = await pool.query(
            "INSERT INTO payments (user_id, session_id, amount, payment_method, payment_date, status) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *",
            [req.user.id, session_id, amount, payment_method, "completed"],
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
                ps.start_time,
                ps.end_time,
                pspace.space_number
            FROM payments p
            JOIN parking_sessions ps ON p.session_id = ps.id
            JOIN parking_spaces pspace ON ps.parking_space_id = pspace.id
            WHERE p.user_id = $1
            ORDER BY p.payment_date DESC
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
        const rate = await pool.query("SELECT * FROM rates WHERE is_active = true LIMIT 1")

        if (rate.rows.length === 0) {
            return res.json({ hourly_rate: 2.5 }) // Default rate
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
