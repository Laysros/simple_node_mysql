// routes/employees.js
module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  router.get('/department/:dept_no', async (req, res) => {
    const { dept_no } = req.params;
    try {
      const [employees] = await pool.query(`
        SELECT e.emp_no, CONCAT(e.first_name, ' ', e.last_name) AS name, s.salary
        FROM employees e
        JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
        JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
        WHERE de.dept_no = ?
        LIMIT 50
      `, [dept_no]);

      let rows = employees.map(e => `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">${e.emp_no}</td>
          <td class="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline">
            <a href="/employees/${e.emp_no}">${e.name}</a>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">$${e.salary.toLocaleString()}</td>
        </tr>`).join('');

      res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Department Employees</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 p-6">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold mb-4">Department Employees</h1>
          <table class="min-w-full divide-y divide-gray-200 border">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Salary</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${rows}
            </tbody>
          </table>
          <div class="mt-4">
            <a href="/" class="text-blue-600 hover:underline">&larr; Back to dashboard</a>
          </div>
        </div>
      </body>
      </html>
      `);
    } catch (err) {
      res.status(500).send('Department error: ' + err.message);
    }
  });

  router.get('/:id', async (req, res) => {
    const empId = req.params.id;

    try {
      const [[emp]] = await pool.query(`
        SELECT e.emp_no, e.first_name, e.last_name, e.gender, e.hire_date, s.salary, t.title, d.dept_name
        FROM employees e
        LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
        LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
        LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
        LEFT JOIN departments d ON de.dept_no = d.dept_no
        WHERE e.emp_no = ?
      `, [empId]);

      if (!emp) return res.status(404).send('Employee not found');

      const [salaryHistory] = await pool.query(`
        SELECT salary, from_date, to_date
        FROM salaries
        WHERE emp_no = ? AND to_date != '9999-01-01'
        ORDER BY from_date DESC
      `, [empId]);

      const fullName = `${emp.first_name} ${emp.last_name}`;
      const photoUrl = `https://robohash.org/${emp.emp_no}?set=set4`;

      let historyRows = salaryHistory.map(row => `
        <tr>
          <td class="px-4 py-2">$${row.salary.toLocaleString()}</td>
          <td class="px-4 py-2">${row.from_date.toISOString().split('T')[0]}</td>
          <td class="px-4 py-2">${row.to_date.toISOString().split('T')[0]}</td>
        </tr>`).join('');

      res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Detail</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 p-6">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center space-x-4 mb-6">
            <img src="${photoUrl}" alt="Avatar" class="w-20 h-20 rounded-full border" />
            <div>
              <h1 class="text-2xl font-bold">${fullName}</h1>
              <p class="text-gray-600">Employee ID: ${emp.emp_no}</p>
            </div>
          </div>
          <div class="space-y-2">
            <p><strong>Gender:</strong> ${emp.gender}</p>
            <p><strong>Hire Date:</strong> ${emp.hire_date.toISOString().split('T')[0]}</p>
            <p><strong>Department:</strong> ${emp.dept_name || 'N/A'}</p>
            <p><strong>Title:</strong> ${emp.title || 'N/A'}</p>
            <p><strong>Current Salary:</strong> $${emp.salary ? emp.salary.toLocaleString() : 'N/A'}</p>
          </div>

          <h2 class="text-xl font-semibold mt-8 mb-4">Previous Salaries</h2>
          <table class="min-w-full border divide-y divide-gray-200 mb-6">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${historyRows}
            </tbody>
          </table>

          <div>
            <a href="/" class="text-blue-600 hover:underline">&larr; Back to dashboard</a>
          </div>
        </div>
      </body>
      </html>
      `);
    } catch (err) {
      res.status(500).send('Error fetching employee details: ' + err.message);
    }
  });

  return router;
};
