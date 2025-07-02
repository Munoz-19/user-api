const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render provee DATABASE_URL como variable de entorno
  ssl: {
    rejectUnauthorized: false, // importante para conexiones seguras en Render
  },
});

// Crear tabla si no existe
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        photo TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL
      )
    `);
    console.log('Tabla "users" creada o ya existente.');
  } catch (error) {
    console.error('Error creando la tabla:', error);
  }
};

createTable();

// Endpoint para registrar usuario
app.post('/api/users', async (req, res) => {
  const { name, email, phone, photo, latitude, longitude } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (name, email, phone, photo, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, email, phone, photo, latitude, longitude]
    );
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al insertar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Endpoint para obtener usuarios
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en el puerto ${PORT}`);
});
