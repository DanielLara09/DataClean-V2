import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../db.js';
import allow from '../middleware/allow.js';
const router = Router();

/**
 * GET /api/clientes
 * Lista de clientes (id + nombre + datos básicos)
 * Acceso: cualquier usuario autenticado
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, identificacion, direccion, telefono, correo, ciudad FROM cliente ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al listar clientes:', err);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
});

/**
 * GET /api/clientes/:id
 * Detalle de un cliente
 * Acceso: cualquier usuario autenticado
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, nombre, identificacion, direccion, telefono, correo, ciudad FROM cliente WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

/**
 * POST /api/clientes
 * Crear cliente
 * Acceso: solo ADMIN
 */
router.post('/', allow('ADMIN'), async (req, res) => {
  try {
    const { nombre, identificacion, direccion, telefono, correo, ciudad } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const id = randomUUID();

    await pool.query(
      `INSERT INTO cliente (id, nombre, identificacion, direccion, telefono, correo, ciudad)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre, identificacion || null, direccion || null, telefono || null, correo || null, ciudad || 'Barranquilla']
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

/**
 * PUT /api/clientes/:id
 * Actualizar cliente
 * Acceso: solo ADMIN
 */
router.put('/:id', allow('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, identificacion, direccion, telefono, correo, ciudad } = req.body;

    const [result] = await pool.query(
      `UPDATE cliente
       SET nombre = ?, identificacion = ?, direccion = ?, telefono = ?, correo = ?, ciudad = ?
       WHERE id = ?`,
      [nombre, identificacion || null, direccion || null, telefono || null, correo || null, ciudad || 'Barranquilla', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

/**
 * DELETE /api/clientes/:id
 * Eliminar cliente
 * Acceso: solo ADMIN
 */
router.delete('/:id', allow('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM cliente WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

export default router;
