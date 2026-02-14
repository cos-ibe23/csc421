const pool = require("./db");

pool.query("SELECT NOW()")
  .then(res => {
    console.log("DB connected at:", res.rows[0].now);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

