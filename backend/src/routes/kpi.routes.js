// backend/src/routes/kpi.routes.js
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import allow from '../middleware/allow.js';
import { kpiDiario } from '../services/kpi.service.js';

const router = Router();

// GET /api/kpis/diario?desde=YYYY-MM-DD&hasta=YYYY-MM-DD[&cliente_id=...]
router.get('/diario', auth, allow('ADMIN'), async (req, res) => {
  try {
    const { desde, hasta, cliente_id } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Debe enviar desde y hasta' });
    }

    const data = await kpiDiario(desde, hasta, cliente_id || null);
    res.json(data);
  } catch (err) {
    console.error('Error KPI diario:', err);
    res.status(500).json({ error: 'Error al obtener KPIs' });
  }
});

export default router;
