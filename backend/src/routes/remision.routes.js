import { Router } from 'express';
import { pool } from '../db.js';
import { auth, allow } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

router.post('/', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  const id = uuid();
  const { despacho_id, numero, tipo, fecha } = req.body;
  await pool.query(
    `INSERT INTO remision (id, despacho_id, numero, tipo, fecha) VALUES (?,?,?,?,?)`,
    [id, despacho_id, numero, tipo, fecha]
  );
  res.status(201).json({ id });
});

router.get('/', auth, allow('ADMIN','DESPACHO'), async (req, res) => {
  const { despacho_id } = req.query;
  const [rows] = await pool.query('SELECT * FROM remision WHERE despacho_id=?', [despacho_id]);
  res.json(rows);
});

export default router;