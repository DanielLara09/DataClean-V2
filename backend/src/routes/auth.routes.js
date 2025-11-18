import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM usuario WHERE email=?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({error:'Credenciales inválidas'});
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({error:'Credenciales inválidas'});
  const token = jwt.sign({ id: user.id, rol: user.rol, nombre: user.nombre }, process.env.JWT_SECRET, { expiresIn: `${process.env.TOKEN_TTL_MIN || 30}m` });
  res.json({ token, user: { id:user.id, nombre:user.nombre, rol:user.rol, email:user.email } });
});

export default router;