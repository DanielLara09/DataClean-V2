import { Router } from 'express';
import { pool } from '../db.js';
import { auth, allow } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM cliente ORDER BY creado_en DESC');
  res.json(rows);
});

router.post('/', auth, allow('ADMIN'), async (req, res) => {
  const id = uuid();
  const { nombre, identificacion, direccion, telefono, correo, ciudad } = req.body;
  await pool.query(
    'INSERT INTO cliente (id,nombre,identificacion,direccion,telefono,correo,ciudad) VALUES (?,?,?,?,?,?,?)',
    [id, nombre, identificacion, direccion, telefono, correo, ciudad]
  );
  res.status(201).json({ id });
});

router.put('/:id', auth, allow('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono, correo, ciudad } = req.body;
  await pool.query(
    'UPDATE cliente SET nombre=?,direccion=?,telefono=?,correo=?,ciudad=? WHERE id=?',
    [nombre, direccion, telefono, correo, ciudad, id]
  );
  res.json({ ok: true });
});

router.delete('/:id', auth, allow('ADMIN'), async (req, res) => {
  await pool.query('DELETE FROM cliente WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

export default router;