const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");



const SECRET = "tailscale_secret";

const app = express();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
   ssl: { rejectUnauthorized: false }
});


app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// ================== SIGNUP ==================
const bcrypt = require("bcrypt");

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO customers (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [name, email, passwordHash]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).send("Signup failed");
  }
});


// ================== LOGIN ==================
app.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Invalid credentials");
    }

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
    };

    const token = jwt.sign(user, SECRET);
    res.cookie("session", token, { httpOnly: true });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
});


// ================== ME ==================
app.get("/me", (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, SECRET);
    res.json({ name: user.name });
  } catch {
    res.sendStatus(401);
  }
});


// ================== ORDERS ==================
app.post("/orders", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, SECRET);
    const { origin, destination, weight } = req.body;

    await pool.query(
      "INSERT INTO orders (customer_id, origin, destination, weight) VALUES ($1,$2,$3,$4)",
      [user.id, origin, destination, weight]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).send("Order failed");
  }
});


// ================== HTTPS SERVER ==================


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.post("/orders", async (req, res) => {
  const token = req.cookies.session;
  if (!token) return res.sendStatus(401);

  const user = jwt.verify(token, SECRET);
  const { origin, destination, weight } = req.body;

  try {
    await pool.query(
      "INSERT INTO orders (customer_id, origin, destination, weight) VALUES ($1,$2,$3,$4)",
      [user.id, origin, destination, weight]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).send("Order failed");
  }
});
