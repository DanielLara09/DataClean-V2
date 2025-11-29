import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../db.js';
import { auth, allow } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  const { cliente_id, desde, hasta, turno } = req.query;
  let sql = `
    SELECT d.*, c.nombre AS cliente_nombre
    FROM despacho d
    JOIN cliente c ON c.id = d.cliente_id
    WHERE 1 = 1
  `;
  const params = [];
  if (cliente_id) { sql += ' AND d.cliente_id = ?'; params.push(cliente_id); }
  if (desde) { sql += ' AND DATE(d.fecha) >= ?'; params.push(desde); }
  if (hasta) { sql += ' AND DATE(d.fecha) <= ?'; params.push(hasta); }
  if (turno) { sql += ' AND d.turno = ?'; params.push(turno); }
  sql += ' ORDER BY d.fecha DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});



function normalizarEstado(estado) {
  if (!estado) return estado;
  const mapa = {
    'entregado': 'ENTREGADO',
    'pendiente': 'PENDIENTE',
    'cerrado': 'CERRADO',
    'en transito': 'EN_TRANSITO',
    'en tránsito': 'EN_TRANSITO',
  };
  const clave = estado.toLowerCase();
  return mapa[clave] || estado;
}

router.post('/', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  try {
    const { cliente_id, fecha, turno, kilosDespachados, estado } = req.body;

    if (!fecha) {
      return res.status(400).json({ error: 'La fecha es obligatoria' });
    }

    const id = randomUUID();
    const creado_por = req.user.id;
    const estadoNormalizado = normalizarEstado(estado);

    await pool.query(
      `INSERT INTO despacho (id, cliente_id, fecha, turno, kilosDespachados, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, cliente_id, fecha.replace('T', ' '), turno, kilosDespachados, estadoNormalizado, creado_por]
    );

    res.status(201).json({ id });

  } catch (err) {
    console.error('Error al crear despacho:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  const { id } = req.params;
  const { fecha, turno, kilosDespachados, estado } = req.body;

  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es obligatoria' });
  }

  const estadoNormalizado = normalizarEstado(estado);

  await pool.query(
    `UPDATE despacho SET fecha=?, turno=?, kilosDespachados=?, estado=? WHERE id=?`,
    [fecha.replace('T', ' '), turno, kilosDespachados, estadoNormalizado, id]
  );
  res.json({ ok:true });
});

router.delete('/:id', auth, allow('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM despacho WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json({ ok: true, mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando despacho:', err);
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
});


export default router;
