import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import allow from '../middleware/allow.js';
import { kpiDiario } from '../services/kpi.service.js';
import { pool } from '../db.js';   // 👈 asegúrate de importar pool

const router = Router();

// ... ruta /diario normal aquí ...

// GET /api/kpis/diario/export?desde=YYYY-MM-DD&hasta=YYYY-MM-DD[&cliente_id=...]
router.get('/diario/export', auth, allow('ADMIN'), async (req, res) => {
  try {
    const { desde, hasta, cliente_id } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Debe enviar desde y hasta' });
    }

    // Datos de KPI (igual que antes)
    const rows = await kpiDiario(desde, hasta, cliente_id || null);

    // 🔹 Obtener nombre de cliente (si se envió cliente_id)
    let clienteNombre;
    if (cliente_id) {
      const [result] = await pool.query(
        'SELECT nombre FROM cliente WHERE id = ?',
        [cliente_id]
      );
      if (result.length > 0) {
        clienteNombre = result[0].nombre;
      } else {
        clienteNombre = `Cliente ${cliente_id}`;
      }
    } else {
      clienteNombre = 'Todos los clientes';
    }

    // Cabecera CSV (ahora incluye cliente)
    let csv = 'cliente,fecha,kg_lavado,kg_despachado,diferencia\n';

    for (const r of rows) {
      const fecha = new Date(r.dia).toISOString().slice(0, 10); // YYYY-MM-DD
      const lavado = Number(r.kg_lavados || 0);
      const despacho = Number(r.kg_despachados || 0);
      const diff = lavado - despacho;

      csv += `${clienteNombre},${fecha},${lavado},${despacho},${diff}\n`;
    }

    // Fila de totales
    const totalLavado = rows.reduce(
      (acc, r) => acc + Number(r.kg_lavados || 0),
      0
    );
    const totalDespacho = rows.reduce(
      (acc, r) => acc + Number(r.kg_despachados || 0),
      0
    );
    const totalDiff = totalLavado - totalDespacho;

    const etiquetaTotal = cliente_id
      ? `TOTAL ${clienteNombre}`
      : 'TOTAL TODOS';

    csv += `${etiquetaTotal},,${totalLavado},${totalDespacho},${totalDiff}\n`;

    const nombreArchivo = `kpi-diario-${desde}_a_${hasta}${
      cliente_id ? `-cliente-${cliente_id}` : '-todos'
    }.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombreArchivo}"`
    );
    res.status(200).send(csv);
  } catch (err) {
    console.error('Error exportando KPIs:', err);
    res.status(500).json({ error: 'Error al exportar KPIs' });
  }
});

export default router;
