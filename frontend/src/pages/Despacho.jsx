import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Despacho() {
  const [clientes, setClientes] = useState([]);
  const [despachos, setDespachos] = useState([]);
  const [editId, setEditId] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    cliente_id: '',
    turno: 'Mañana',
    kilosDespachados: '',
    estado: 'Entregado',
  });

  const [filtros, setFiltros] = useState({
    cliente_id: '',
    desde: '',
    hasta: '',
    turno: '',
  });

  function onChangeForm(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onChangeFiltro(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  function limpiarForm() {
    setForm({
      cliente_id: '',
      turno: 'Mañana',
      kilosDespachados: '',
      estado: 'Entregado',
    });
    setEditId(null);
  }

  function limpiarFiltros() {
    setFiltros({
      cliente_id: '',
      desde: '',
      hasta: '',
      turno: '',
    });
    cargarDespachos();
  }

  async function cargarClientes() {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los clientes');
    }
  }

  async function cargarDespachos() {
    try {
      setCargando(true);
      const params = new URLSearchParams();

      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.turno) params.append('turno', filtros.turno);

      const qs = params.toString();
      const url = qs ? `/despacho?${qs}` : '/despacho';

      const { data } = await api.get(url);
      setDespachos(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los despachos');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarClientes();
    cargarDespachos();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (!form.cliente_id) {
        setError('Debe seleccionar un cliente');
        return;
      }
      if (!form.kilosDespachados) {
        setError('Debe ingresar los kilos despachados');
        return;
      }

      const payload = {
        turno: form.turno,
        kilosDespachados: Number(form.kilosDespachados),
        estado: form.estado,
      };

      if (editId) {
        await api.put(`/despacho/${editId}`, payload);
      } else {
        await api.post('/despacho', { ...payload, cliente_id: form.cliente_id });
      }

      limpiarForm();
      await cargarDespachos();
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el despacho');
    }
  }

  async function eliminarDespacho(id) {
    if (!window.confirm('¿Seguro que desea eliminar este despacho?')) return;
    try {
      await api.delete(`/despacho/${id}`);
      await cargarDespachos();
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el despacho');
    }
  }

  function empezarEdicion(d) {
    setEditId(d.id);
    setForm({
      cliente_id: d.cliente_id,
      turno: d.turno,
      kilosDespachados: d.kilosDespachados,
      estado: d.estado,
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Registro de Despacho</h1>

      <form className="grid gap-3 md:grid-cols-4 mb-6" onSubmit={onSubmit}>
        <select
          name="cliente_id"
          className="border p-2 md:col-span-2"
          value={form.cliente_id}
          onChange={onChangeForm}
          disabled={!!editId}
        >
          <option value="">Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          name="turno"
          className="border p-2"
          value={form.turno}
          onChange={onChangeForm}
        >
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>

        <input
          name="kilosDespachados"
          className="border p-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Kilos despachados"
          value={form.kilosDespachados}
          onChange={onChangeForm}
        />

        <select
          name="estado"
          className="border p-2 md:col-span-2"
          value={form.estado}
          onChange={onChangeForm}
        >
          <option value="Entregado">Entregado</option>
          <option value="En tránsito">En tránsito</option>
          <option value="Pendiente">Pendiente</option>
        </select>

        <button className="border px-4 py-2 md:col-span-1">
          {editId ? 'Actualizar' : 'Guardar'}
        </button>
        {editId && (
          <button
            type="button"
            className="border px-4 py-2 md:col-span-1"
            onClick={limpiarForm}
          >
            Cancelar
          </button>
        )}
      </form>

      {error && (
        <div className="text-red-600 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <select
          className="border p-2 md:col-span-2"
          name="cliente_id"
          value={filtros.cliente_id}
          onChange={onChangeFiltro}
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2"
          name="desde"
          value={filtros.desde}
          onChange={onChangeFiltro}
        />

        <input
          type="date"
          className="border p-2"
          name="hasta"
          value={filtros.hasta}
          onChange={onChangeFiltro}
        />

        <select
          className="border p-2"
          name="turno"
          value={filtros.turno}
          onChange={onChangeFiltro}
        >
          <option value="">Todos los turnos</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>

        <button
          type="button"
          className="border px-4 py-2"
          onClick={cargarDespachos}
        >
          Filtrar
        </button>

        <button
          type="button"
          className="border px-4 py-2"
          onClick={limpiarFiltros}
        >
          Limpiar
        </button>
      </div>

      {cargando ? (
        <div>Cargando despachos...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Fecha</th>
                <th className="border px-2 py-1 text-left">Cliente</th>
                <th className="border px-2 py-1 text-left">Turno</th>
                <th className="border px-2 py-1 text-right">Kilos</th>
                <th className="border px-2 py-1 text-left">Estado</th>
                <th className="border px-2 py-1 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {despachos.map((d) => (
                <tr key={d.id}>
                  <td className="border px-2 py-1">
                    {d.fecha
                      ? new Date(d.fecha).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                      : ''}
                  </td>
                  <td className="border px-2 py-1">
                    {d.cliente_nombre || d.cliente || ''}
                  </td>
                  <td className="border px-2 py-1">{d.turno}</td>
                  <td className="border px-2 py-1 text-right">
                    {d.kilosDespachados}
                  </td>
                  <td className="border px-2 py-1">{d.estado}</td>
                  <td className="border px-2 py-1">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 underline"
                        type="button"
                        onClick={() => empezarEdicion(d)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-red-600 underline"
                        type="button"
                        onClick={() => eliminarDespacho(d.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {despachos.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border px-2 py-2 text-center text-gray-500"
                  >
                    No hay despachos registrados con los filtros actuales.
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
