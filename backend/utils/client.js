import pkg from 'pg';
const { Client } = pkg;

export const client = new Client({
  host: process.env.DB_HOST,
  user: "postgres",
  password: "test",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
