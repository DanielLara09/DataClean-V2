import { useEffect, useState } from 'react';
import api from '../api/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

function getHoyISO() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getPrimerDiaMesISO() {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}-01`;
}

export default function Dashboard() {
  const [desde, setDesde] = useState(getPrimerDiaMesISO());
  const [hasta, setHasta] = useState(getHoyISO());
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // 🔹 Nuevo: clientes y filtro por cliente
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');

  // KPIs agregados
  const totalLavado = datos.reduce(
    (acc, d) => acc + Number(d.kg_lavados || 0),
    0
  );
  const totalDespacho = datos.reduce(
    (acc, d) => acc + Number(d.kg_despachados || 0),
    0
  );
  const diferencia = totalLavado - totalDespacho;

  const datosGrafica = datos
    .slice()
    .sort((a, b) => new Date(a.dia) - new Date(b.dia))
    .map((d) => ({
      ...d,
      diaLabel: new Date(d.dia).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
      }),
      lavado: Number(d.kg_lavados || 0),
      despacho: Number(d.kg_despachados || 0),
    }));

  async function exportarCsv() {
    try {
      if (!desde || !hasta) {
        setError('Debe seleccionar un rango de fechas válido');
        return;
      }

      const params = new URLSearchParams({ desde, hasta });
      if (clienteId) params.append('cliente_id', clienteId);

      // Usamos axios con responseType: 'blob'
      const response = await api.get('/kpis/diario/export?' + params.toString(), {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      const nombre = `kpi-diario-${desde}_a_${hasta}${clienteId ? `-cliente-${clienteId}` : ''}.csv`;
      link.setAttribute('download', nombre);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando CSV:', err);
      setError('Error al exportar el archivo CSV');
    }
  }


  async function cargarClientes() {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch (err) {
      console.error(err);
      // no es crítico para el dashboard, pero lo podrías mostrar
    }
  }

  async function cargarKpis() {
    try {
      if (!desde || !hasta) {
        setError('Debe seleccionar un rango de fechas válido');
        return;
      }
      setCargando(true);
      setError('');

      const params = new URLSearchParams({ desde, hasta });
      if (clienteId) {
        params.append('cliente_id', clienteId); // 👈 clave: cliente_id
      }

      const { data } = await api.get('/kpis/diario?' + params.toString());
      setDatos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los KPIs');
    } finally {
      setCargando(false);
    }
  }


  useEffect(() => {
    cargarClientes();
    cargarKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Dashboard operativo</h1>

      {/* Filtros de cliente + fecha */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4 items-end">
        <div className="md:col-span-2">
          {/* Cliente */}
          <label className="block text-xs mb-1">Cliente</label>
          <select
            className="border p-2 w-full"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1">Desde</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Hasta</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>

        <button
          className="border px-4 py-2"
          onClick={cargarKpis}
        >
          Actualizar
        </button>

        <button
          className="border px-4 py-2"
          onClick={exportarCsv}
        >
          Exportar CSV
        </button>
      </div>


      {error && (
        <div className="text-red-600 text-sm mb-3">
          {error}
        </div>
      )}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">
            Total lavado{clienteId ? ' (cliente)' : ''}
          </div>
          <div className="text-2xl font-semibold">
            {totalLavado.toLocaleString('es-CO', {
              minimumFractionDigits: 0,
            })}{' '}
            kg
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">
            Total despachado{clienteId ? ' (cliente)' : ''}
          </div>
          <div className="text-2xl font-semibold">
            {totalDespacho.toLocaleString('es-CO', {
              minimumFractionDigits: 0,
            })}{' '}
            kg
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">
            Diferencia (lavado - despacho)
          </div>
          <div
            className={
              'text-2xl font-semibold ' +
              (diferencia >= 0 ? 'text-green-700' : 'text-red-700')
            }
          >
            {diferencia.toLocaleString('es-CO', {
              minimumFractionDigits: 0,
            })}{' '}
            kg
          </div>
        </div>
      </div>

      {/* Gráfica */}
      {!cargando && datosGrafica.length > 0 && (
        <div className="border rounded-lg p-4 mb-6" style={{ height: 300 }}>
          <h2 className="text-sm font-semibold mb-2">
            Evolución diaria (Lavado vs Despacho)
            {clienteId ? ' - cliente seleccionado' : ' - todos los clientes'}
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="diaLabel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="lavado"
                name="Lavado (kg)"
                stroke="#8884d8"
              />
              <Line
                type="monotone"
                dataKey="despacho"
                name="Despacho (kg)"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla detalle */}
      {cargando ? (
        <div>Cargando datos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Fecha</th>
                <th className="border px-2 py-1 text-right">Lavado (kg)</th>
                <th className="border px-2 py-1 text-right">Despachado (kg)</th>
                <th className="border px-2 py-1 text-right">Diferencia (kg)</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => {
                const diff =
                  Number(d.kg_lavados || 0) -
                  Number(d.kg_despachados || 0);
                return (
                  <tr key={d.dia}>
                    <td className="border px-2 py-1">
                      {new Date(d.dia).toLocaleDateString('es-CO')}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {Number(d.kg_lavados || 0).toLocaleString('es-CO')}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      {Number(d.kg_despachados || 0).toLocaleString('es-CO')}
                    </td>
                    <td
                      className={
                        'border px-2 py-1 text-right ' +
                        (diff >= 0 ? 'text-green-700' : 'text-red-700')
                      }
                    >
                      {diff.toLocaleString('es-CO')}
                    </td>
                  </tr>
                );
              })}

              {datos.length === 0 && !cargando && (
                <tr>
                  <td
                    colSpan={4}
                    className="border px-2 py-2 text-center text-gray-500"
                  >
                    No hay datos en el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
