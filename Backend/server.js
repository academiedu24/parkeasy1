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

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});