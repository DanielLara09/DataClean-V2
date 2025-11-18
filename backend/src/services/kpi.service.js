import { pool } from '../db.js';

export async function kpiDiario(desde, hasta){
  const [rows] = await pool.query(
    `SELECT * FROM v_kpi_diario WHERE dia BETWEEN ? AND ? ORDER BY dia DESC LIMIT 180`,
    [desde, hasta]
  );
  return rows;
}