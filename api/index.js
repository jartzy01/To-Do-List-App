// api/index.js
const express = require('express');
const mysql = require('mysql2/promise'); // Using mysql2 with promise support
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Loads variables from .env

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configure MariaDB connection using your updated credentials
const dbConfig = {
  host: '127.0.0.1',
  user: process.env.MARIADB_USER || 'to-do-user',
  password: process.env.MARIADB_PASSWORD || '654321',
  database: process.env.MARIADB_DATABASE || 'to-do-db',
};

// Initialize the database by creating the "tasks" table if it does not exist.
async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MariaDB.");

    // Create the tasks table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        isCompleted TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ 'tasks' table is ready.");
    await connection.end();
  } catch (err) {
    console.error("Error initializing database:", err.message);
  }
}
initializeDatabase();

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM tasks");
    await connection.end();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET a single task by id
app.get("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM tasks WHERE id = ?", [id]);
    await connection.end();
    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found!" });
    }
    res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST create new task (requires title & description)
app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    console.log("Missing fields in request!");
    return res.status(400).json({ error: "Title and description are required." });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "INSERT INTO tasks (title, description) VALUES (?, ?)",
      [title, description]
    );
    console.log("✅ Task Inserted:", title, description);
    await connection.end();
    res.json({ 
      id: result.insertId, 
      title, 
      description, 
      isCompleted: 0, 
      created_at: new Date().toISOString() 
    });
  } catch (err) {
    console.error("Database Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// PUT update a task by id
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, isCompleted } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "UPDATE tasks SET title = ?, description = ?, isCompleted = ? WHERE id = ?",
      [title, description, isCompleted ?? 0, id]
    );
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found!" });
    }
    res.json({ message: "✅ Task updated successfully!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE a task by id
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute("DELETE FROM tasks WHERE id = ?", [id]);
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found!" });
    }
    res.json({ message: "✅ Task deleted successfully!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
