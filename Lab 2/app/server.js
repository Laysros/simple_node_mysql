// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

const pool = mysql.createPool({
  host: '172.23.32.154',
  port: 3307,
  user: 'cadt',
  password: 'password123',
  database: 'employees',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use('/', require('./routes/dashboard')(pool));
app.use('/employees', require('./routes/employees')(pool));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});