import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../db.js';
import { auth, allow } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  const { desde, hasta, cliente_id, estado } = req.query;
  const params = [];
  let sql = 'SELECT d.*, c.nombre AS cliente FROM despacho d JOIN cliente c ON c.id=d.cliente_id WHERE 1=1';
  if (cliente_id) { sql += ' AND d.cliente_id=?'; params.push(cliente_id); }
  if (estado) { sql += ' AND d.estado=?'; params.push(estado); }
  if (desde) { sql += ' AND d.fecha>=?'; params.push(desde); }
  if (hasta) { sql += ' AND d.fecha<?'; params.push(hasta); }
  sql += ' ORDER BY d.fecha DESC LIMIT 200';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  try {
    const { cliente_id, turno, kilosDespachados, estado } = req.body;

    const id = randomUUID();
    const creado_por = req.user.id;

    // Usar NOW() para evitar problemas con formato
    await pool.query(
      `INSERT INTO despacho (id, cliente_id, fecha, turno, kilosDespachados, estado, creado_por)
       VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
      [id, cliente_id, turno, kilosDespachados, estado, creado_por]
    );

    res.status(201).json({ id });

  } catch (err) {
    console.error('Error al crear despacho:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  const { id } = req.params;
  const { turno, kilosDespachados, estado } = req.body;
  await pool.query(
    `UPDATE despacho SET turno=?, kilosDespachados=?, estado=? WHERE id=?`,
    [turno, kilosDespachados, estado, id]
  );
  res.json({ ok:true });
});

export default router;