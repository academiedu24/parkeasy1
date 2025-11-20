require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pool = require("./database")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library')
const nodemailer = require('nodemailer');

var app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
}));

const PORT = process.env.PORT || 3000;


app.get("/", (req, res) => {
    res.send("ParkEasy Backend funcionando ...");
});

// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Consultar el usuario en la base de datos
        const user = await pool.query('SELECT * FROM user_mobile WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const userInfo = user.rows[0];

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, userInfo.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar un token JWT
        const token = jwt.sign({ email: userInfo.email }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});



app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});