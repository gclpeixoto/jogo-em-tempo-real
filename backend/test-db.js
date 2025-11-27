require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

client.connect()
  .then(() => console.log("✅ Conectou ao Postgres!"))
  .catch(err => console.error("❌ Erro:", err.message))
  .finally(() => client.end());
