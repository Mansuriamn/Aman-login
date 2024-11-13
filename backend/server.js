const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path=require('path')

dotenv.config();

const _dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://aman-login.onrender.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(cors({
     origin: ['https://aman-login.onrender.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
   }));
app.use(express.json());
app.use(express.static(path.join(_dirname, "/frontend/dist")));


// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', // Add quotes around default values
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ulogin',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Received login attempt with username: ${username}, password: ${password}`);

  // Query the database for user data
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
            res.json({ success: false, message: 'Internal server error' });

    } else if (results.length > 0) {
      res.json({ success: true, message: 'Login successful!' });
    } else {
                  res.json({ success: false, message: 'Invalid username or password' });

    }
  });
});


app.get('*', (req, res) => {
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
