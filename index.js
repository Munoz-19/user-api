const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Base de datos SQLite
const db = new sqlite3.Database('./database.sqlite');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      photo TEXT,
      latitude REAL,
      longitude REAL
    )
  `);
});

// Endpoint para registrar usuario
app.post('/api/users', (req, res) => {
  const { name, email, phone, photo, latitude, longitude } = req.body;

  if (!name || !email || !phone || !photo || !latitude || !longitude) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const stmt = db.prepare(`
    INSERT INTO users (name, email, phone, photo, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(name, email, phone, photo, latitude, longitude, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    res.json({ id: this.lastID });
  });
});

// Endpoint para consultar usuarios
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(rows);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
