import { pool } from '../db.js';

export async function kpiDiario(desde, hasta, clienteId = null) {
  const withCliente = Boolean(clienteId);

  const sql = `
    SELECT 
      t.dia,
      SUM(t.kg_lavados) AS kg_lavados,
      SUM(t.kg_despachados) AS kg_despachados
    FROM (
      -- Lavado por dia
      SELECT
        DATE(l.fecha) AS dia,
        SUM(
          COALESCE(l.bajaKg,0) +
          COALESCE(l.altaKg,0) +
          COALESCE(l.infectoKg,0) +
          COALESCE(l.reprocesoKg,0) +
          COALESCE(l.desmancheKg,0)
        ) AS kg_lavados,
        0 AS kg_despachados
      FROM lavado l
      WHERE DATE(l.fecha) BETWEEN ? AND ?
        ${withCliente ? 'AND l.cliente_id = ?' : ''}
      GROUP BY DATE(l.fecha)

      UNION ALL

      -- Despacho por dia
      SELECT
        DATE(d.fecha) AS dia,
        0 AS kg_lavados,
        SUM(COALESCE(d.kilosDespachados,0)) AS kg_despachados
      FROM despacho d
      WHERE DATE(d.fecha) BETWEEN ? AND ?
        ${withCliente ? 'AND d.cliente_id = ?' : ''}
      GROUP BY DATE(d.fecha)
    ) t
    GROUP BY t.dia
    ORDER BY t.dia;
  `;

  const params = withCliente
    ? [desde, hasta, clienteId, desde, hasta, clienteId]
    : [desde, hasta, desde, hasta];

  const [rows] = await pool.query(sql, params);
  return rows;
}
