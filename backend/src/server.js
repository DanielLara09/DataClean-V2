import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import lavadoRoutes from './routes/lavado.routes.js';
import despachoRoutes from './routes/despacho.routes.js';
import remisionRoutes from './routes/remision.routes.js';
import incidenciaRoutes from './routes/incidencia.routes.js';
import kpiRoutes from './routes/kpi.routes.js';
import { auth, allow } from './middleware/auth.js';
import { kpiDiario } from './services/kpi.service.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://datacleansas.netlify.app'
];

// 🚨 SOLO UNA CONFIGURACIÓN DE CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/clientes', auth, clientesRoutes);
app.use('/api/lavado', lavadoRoutes);
app.use('/api/despacho', despachoRoutes);
app.use('/api/remision', remisionRoutes);
app.use('/api/incidencia', incidenciaRoutes);

app.get('/api/kpis/diario', auth, allow('ADMIN'), async (req, res) => {
  const { desde, hasta } = req.query;
  const data = await kpiDiario(desde, hasta);
  res.json(data);
});

app.get('/', (_, res) => res.json({ ok:true, name:'DataClean API' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API escuchando en :${port}`));
