import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import  allow  from '../middleware/allow.js';
import { kpiDiario } from '../services/kpi.service.js';

const router = Router();

router.get('/diario', auth, allow('ADMIN'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Debe enviar desde y hasta' });
    }
    const data = await kpiDiario(desde, hasta);
    res.json(data);
  } catch (err) {
    console.error('Error KPI diario:', err);
    res.status(500).json({ error: 'Error al obtener KPIs' });
  }
});

export default router;
