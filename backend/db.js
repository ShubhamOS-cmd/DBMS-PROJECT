// Database connection pool using mysql2/promise
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool for efficient database access
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});
console.log(pool);
// Test database connectivity by running a lightweight query
export async function testConnection() {
  await pool.query('SELECT 1');
}

export default pool;
