// routes/dashboard.js
module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const [[{ total_departments }]] = await pool.query(`SELECT COUNT(*) AS total_departments FROM departments`);
      const [[{ total_employees }]] = await pool.query(`SELECT COUNT(*) AS total_employees FROM employees`);
      const [salaryData] = await pool.query(`
        SELECT YEAR(from_date) AS year, SUM(salary) AS total_salary
        FROM salaries
        GROUP BY YEAR(from_date)
        ORDER BY year
      `);

      const [departments] = await pool.query(`
        SELECT d.dept_no, d.dept_name, COUNT(de.emp_no) AS emp_count
        FROM departments d
        JOIN dept_emp de ON d.dept_no = de.dept_no AND de.to_date = '9999-01-01'
        GROUP BY d.dept_no
      `);

      const years = salaryData.map(row => row.year);
      const totals = salaryData.map(row => row.total_salary);

      let deptList = departments.map(d => `<li><a class="text-blue-600 hover:underline" href="/employees/department/${d.dept_no}">${d.dept_name} (${d.emp_count})</a></li>`).join('');

      res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Company Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body class="bg-gray-100 p-6">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-3xl font-bold mb-6">Company Dashboard</h1>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div class="bg-white shadow p-6 rounded-lg">
              <h2 class="text-lg font-semibold text-gray-700">Total Departments</h2>
              <p class="text-2xl font-bold text-blue-600">${total_departments}</p>
            </div>
            <div class="bg-white shadow p-6 rounded-lg">
              <h2 class="text-lg font-semibold text-gray-700">Total Employees</h2>
              <p class="text-2xl font-bold text-green-600">${total_employees}</p>
            </div>
          </div>

          <div class="bg-white shadow p-6 rounded-lg mb-10">
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Employees by Department</h2>
            <ul class="list-disc pl-5 space-y-1">
              ${deptList}
            </ul>
          </div>

          <div class="bg-white shadow p-6 rounded-lg">
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Total Salary by Year</h2>
            <canvas id="salaryChart" height="100"></canvas>
          </div>
        </div>

        <script>
          const ctx = document.getElementById('salaryChart').getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(years)},
              datasets: [{
                label: 'Total Salary ($)',
                data: ${JSON.stringify(totals)},
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => '$' + value.toLocaleString()
                  }
                }
              }
            }
          });
        </script>
      </body>
      </html>
      `);
    } catch (err) {
      res.status(500).send('Dashboard error: ' + err.message);
    }
  });

  return router;
};