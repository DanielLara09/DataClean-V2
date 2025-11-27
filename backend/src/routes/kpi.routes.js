import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import allow from '../middleware/allow.js';
import { kpiDiario } from '../services/kpi.service.js';

const router = Router();

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

router.get('/diario/export', auth, allow('ADMIN'), async (req, res) => {
  try {
    const { desde, hasta, cliente_id } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Debe enviar desde y hasta' });
    }

    const data = await kpiDiario(desde, hasta, cliente_id || null);

    const header = 'dia,kg_lavados,kg_despachados';
    const rows = data.map((d) => {
      const dia = new Date(d.dia);
      const diaStr = Number.isNaN(dia.getTime())
        ? d.dia
        : dia.toISOString().slice(0, 10);
      const lavados = d.kg_lavados ?? 0;
      const despachados = d.kg_despachados ?? 0;
      return `${diaStr},${lavados},${despachados}`;
    });

    const csv = [header, ...rows].join('\n');
    const filename = `kpi-diario-${desde}_a_${hasta}${cliente_id ? `-cliente-${cliente_id}` : ''}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('Error exportando KPI diario CSV:', err);
    res.status(500).json({ error: 'Error al exportar KPIs' });
  }
});

export default router;
