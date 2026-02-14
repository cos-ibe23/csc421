const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const SECRET = "tailscale_secret"; // move to env later

// REGISTER / SIGNUP
exports.signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO customers (name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [name, email, phone, hash]
  );

  res.status(201).json({ success: true });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT id, name, password_hash FROM customers WHERE email = $1",
    [email]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name },
    SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  res.json({ name: user.name });
};
