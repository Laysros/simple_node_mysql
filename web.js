const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

// MySQL connection
const pool = mysql.createPool({
  host: '172.23.32.154',
  port: 3307,
  user: 'cadt',
  password: 'password123',
  database: 'web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Route with Tailwind-styled HTML
app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        users.id AS userId,
        users.name AS userName,
        orders.product AS productName
      FROM users
      INNER JOIN orders ON users.id = orders.user_id
    `);

    // Build Tailwind-styled HTML table
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>User Orders</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-6">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-4">User Orders</h1>
        <table class="min-w-full divide-y divide-gray-200 border">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
    `;

    rows.forEach(row => {
      html += `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">${row.userId}</td>
          <td class="px-6 py-4 whitespace-nowrap">${row.userName}</td>
          <td class="px-6 py-4 whitespace-nowrap">${row.productName}</td>
        </tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    </body>
    </html>
    `;

    res.send(html);

  } catch (err) {
    res.status(500).send('Database error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
