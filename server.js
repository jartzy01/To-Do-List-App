const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); 
const fs = require('fs'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DB_PATH = './db/todos.sqlite';

// Ensure 'db' folder exists
if (!fs.existsSync('./db')) {
    fs.mkdirSync('./db');
}

//Connect to database
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
        return;
    }
    console.log("✅ Connected to todos.sqlite database.");
});

//Create 'tasks' table if it doesn’t exist
db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Error creating tasks table: " + err.message);
        return;
    }
    console.log("✅ 'tasks' table is ready.");
});

//GET all tasks
app.get("/api/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

//GET a single task by id
app.get("/api/tasks/:id", (req, res) => {
    const { id } = req.params; // req.params means the value of the parameter in the URL
    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Task not found!" });
        }
        res.json(row);
    });
});

//POST create new task (only requires title & description)
app.post("/api/tasks", (req, res) => {

    const { title, description } = req.body;

    if (!title || !description) {
        console.log("Missing fields in request!");
        return res.status(400).json({ error: "Title and description are required." });
    }

    db.run(
        "INSERT INTO tasks (title, description) VALUES (?, ?)",
        [title, description],
        function (err) {
            if (err) {
                console.error("Database Error:", err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log("✅ Task Inserted:", title, description);
            res.json({ id: this.lastID, title, description, isCompleted: 0, created_at: new Date().toISOString() });
        }
    );
});

//PUT update a task by id
app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;  
    const { title, description, isCompleted } = req.body;
    
    db.run(
        "UPDATE tasks SET title = ?, description = ?, isCompleted = ? WHERE id = ?",
        [title, description, isCompleted ?? 0, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Task not found!" });
            }
            res.json({ message: "✅ Task updated successfully!" });
        }
    );
});

//DELETE a task by id
app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.run(
        "DELETE FROM tasks where id = ?", [id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Task not found!" });
            }
            res.json({ message: "✅ Task deleted successfully!" });
        });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
