import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // Render limita max_user_connections; mantenemos el pool por debajo de ese umbral
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 2),
  maxIdle: Number(process.env.DB_CONNECTION_LIMIT || 2),
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true
});
