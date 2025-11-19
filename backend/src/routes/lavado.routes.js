import { Router } from 'express';
import { randomUUID } from 'crypto'; 
import { pool } from '../db.js';
import { auth, allow } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/', auth, allow('ADMIN', 'LAVADO'), async (req, res) => {
  try {
    const { cliente_id, desde, hasta, turno } = req.query;

    let sql = `
      SELECT l.*, c.nombre AS cliente_nombre
      FROM lavado l
      JOIN cliente c ON c.id = l.cliente_id
      WHERE 1 = 1
    `;
    const params = [];

    if (cliente_id) {
      sql += ` AND l.cliente_id = ?`;
      params.push(cliente_id);
    }

    if (desde) {
      sql += ` AND DATE(l.fecha) >= ?`;
      params.push(desde);
    }

    if (hasta) {
      sql += ` AND DATE(l.fecha) <= ?`;
      params.push(hasta);
    }

    if (turno) {
      sql += ` AND l.turno = ?`;
      params.push(turno);
    }

    sql += ` ORDER BY l.fecha DESC`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en filtro de lavado:', err);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});


router.post('/', auth, allow('ADMIN','LAVADO'), async (req, res) => {
  try {
    const { cliente_id, turno, bajaKg, altaKg, infectoKg, reprocesoKg, desmancheKg } = req.body;

    const id = randomUUID();
    const creado_por = req.user.id;

    await pool.query(
      `INSERT INTO lavado (id, cliente_id, fecha, turno, bajaKg, altaKg, infectoKg, reprocesoKg, desmancheKg, creado_por)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [id, cliente_id, turno, bajaKg, altaKg, infectoKg, reprocesoKg, desmancheKg, creado_por]
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error('Error al crear lavado:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:id', auth, allow('ADMIN','LAVADO'), async (req, res) => {
  const { id } = req.params;
  const { turno, bajaKg, altaKg, infectoKg, reprocesoKg, desmancheKg } = req.body;
  await pool.query(
    `UPDATE lavado SET turno=?, bajaKg=?, altaKg=?, infectoKg=?, reprocesoKg=?, desmancheKg=? WHERE id=?`,
    [turno, bajaKg, altaKg, infectoKg, reprocesoKg, desmancheKg, id]
  );
  res.json({ ok:true });
});

export default router;