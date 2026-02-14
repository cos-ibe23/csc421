const { Pool } = require("pg");

module.exports = new Pool({
  user: "postgres",
  password: "password",
  host: "localhost",
  database: "tailscale_db",
  port: 5432,
});




const pool = new Pool({
  database: "tailscale_db",
});

pool.query("SELECT NOW()")
  .then(res => console.log("DB connected at:", res.rows[0].now))
  .catch(err => console.error("DB error", err));

module.exports = pool;
