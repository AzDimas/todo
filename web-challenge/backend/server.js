const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Buat objek konfigurasi untuk koneksi database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Port default untuk PostgreSQL
});

// Tes koneksi
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Gagal terhubung ke database:', err);
  } else {
    console.log('Koneksi ke database berhasil:', res.rows[0].now);
  }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Backend Server is running!');
});

// Endpoint untuk menambahkan tugas baru
app.post('/todos', (req, res) => {
  const { task, deadline } = req.body;

  pool.query(
    'INSERT INTO todos (task, completed, created_at, deadline) VALUES ($1, $2, $3, $4) RETURNING *',
    [task, false, new Date(), deadline],
    (err, result) => {
      if (err) {
        console.error('Gagal menambahkan tugas:', err);
        res.status(500).json({ error: 'Gagal menambahkan tugas' });
      } else {
        res.status(201).json(result.rows[0]);
      }
    }
  );
});

// Endpoint untuk mengambil semua tugas
app.get('/todos', (req, res) => {
  pool.query('SELECT * FROM todos', (err, result) => {
    if (err) {
      console.error('Gagal mengambil daftar tugas:', err);
      res.status(500).json({ error: 'Gagal mengambil daftar tugas' });
    } else {
      res.json(result.rows);
    }
  });
});

// Endpoint untuk mengambil satu tugas berdasarkan ID
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  pool.query('SELECT * FROM todos WHERE id = $1', [id], (err, result) => {
    if (err) {
      console.error('Gagal mengambil tugas:', err);
      res.status(500).json({ error: 'Gagal mengambil tugas' });
    } else if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tugas tidak ditemukan' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// Endpoint untuk memperbarui tugas berdasarkan ID
app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const { task, completed, deadline } = req.body;

  pool.query(
    'UPDATE todos SET task = $1, completed = $2, deadline = $3 WHERE id = $4 RETURNING *',
    [task, completed, deadline, id],
    (err, result) => {
      if (err) {
        console.error('Gagal memperbarui tugas:', err);
        res.status(500).json({ error: 'Gagal memperbarui tugas' });
      } else if (result.rows.length === 0) {
        res.status(404).json({ error: 'Tugas tidak ditemukan' });
      } else {
        res.json(result.rows[0]);
      }
    }
  );
});

// Endpoint untuk menghapus tugas berdasarkan ID
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id], (err, result) => {
    if (err) {
      console.error('Gagal menghapus tugas:', err);
      res.status(500).json({ error: 'Gagal menghapus tugas' });
    } else if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tugas tidak ditemukan' });
    } else {
      res.json({ message: 'Tugas berhasil dihapus' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
