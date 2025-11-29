import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Lavado() {
  function toDateTimeLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
  }

  function createInitialForm(clienteId = '') {
    return {
      fecha: toDateTimeLocal(new Date()),
      cliente_id: clienteId,
      turno: 'Mañana',
      bajaKg: '',
      altaKg: '',
      infectoKg: '',
      reprocesoKg: '',
      desmancheKg: '',
    };
  }

  const [clientes, setClientes] = useState([]);
  const [lavados, setLavados] = useState([]);
  const [editId, setEditId] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(createInitialForm());

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

  function limpiarForm(keepCliente = false) {
    const cliente = keepCliente ? form.cliente_id : '';
    setForm(createInitialForm(cliente));
    setEditId(null);
  }

  function limpiarFiltros() {
    setFiltros({
      cliente_id: '',
      desde: '',
      hasta: '',
      turno: '',
    });
    cargarLavados();
  }

  function calcularTotal(row) {
    const b = Number(row.bajaKg || 0);
    const a = Number(row.altaKg || 0);
    const i = Number(row.infectoKg || 0);
    const r = Number(row.reprocesoKg || 0);
    const d = Number(row.desmancheKg || 0);
    return b + a + i + r + d;
  }

  const totalLavadoKg = lavados.reduce((acc, l) => acc + calcularTotal(l), 0);

  async function cargarClientes() {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los clientes');
    }
  }

  async function cargarLavados() {
    try {
      setCargando(true);
      const params = new URLSearchParams();

      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.turno) params.append('turno', filtros.turno);

      const qs = params.toString();
      const url = qs ? `/lavado?${qs}` : '/lavado';

      const { data } = await api.get(url);
      setLavados(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los registros de lavado');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarClientes();
    cargarLavados();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (!form.cliente_id) {
        setError('Debe seleccionar un cliente');
        return;
      }
      if (!form.fecha) {
        setError('Debe ingresar la fecha del registro');
        return;
      }

      const valores = [
        form.bajaKg,
        form.altaKg,
        form.infectoKg,
        form.reprocesoKg,
        form.desmancheKg,
      ];
      const todosVacios = valores.every((v) => v === '' || v === null);
      if (todosVacios) {
        setError('Debe ingresar al menos un tipo de kilo (baja, alta, etc.)');
        return;
      }

      const payload = {
        fecha: form.fecha,
        turno: form.turno,
        bajaKg: Number(form.bajaKg || 0),
        altaKg: Number(form.altaKg || 0),
        infectoKg: Number(form.infectoKg || 0),
        reprocesoKg: Number(form.reprocesoKg || 0),
        desmancheKg: Number(form.desmancheKg || 0),
      };

      if (editId) {
        await api.put(`/lavado/${editId}`, payload);
      } else {
        await api.post('/lavado', { ...payload, cliente_id: form.cliente_id });
      }

      limpiarForm(true);
      await cargarLavados();
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el registro de lavado');
    }
  }

  async function eliminarLavado(id) {
    if (!window.confirm('¿Seguro que desea eliminar este registro?')) return;

    try {
      await api.delete(`/lavado/${id}`);
      await cargarLavados();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al eliminar el registro');
    }
  }

  function empezarEdicion(l) {
    setEditId(l.id);
    setForm({
      fecha: toDateTimeLocal(l.fecha),
      cliente_id: l.cliente_id,
      turno: l.turno,
      bajaKg: l.bajaKg,
      altaKg: l.altaKg,
      infectoKg: l.infectoKg,
      reprocesoKg: l.reprocesoKg,
      desmancheKg: l.desmancheKg,
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Registro de Lavado</h1>

      <form className="grid gap-3 md:grid-cols-7 mb-6" onSubmit={onSubmit}>
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

        <input
          type="datetime-local"
          name="fecha"
          className="border p-2"
          value={form.fecha}
          onChange={onChangeForm}
        />

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
          name="bajaKg"
          className="border p-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Baja Kg"
          value={form.bajaKg}
          onChange={onChangeForm}
        />

        <input
          name="altaKg"
          className="border p-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Alta Kg"
          value={form.altaKg}
          onChange={onChangeForm}
        />

        <input
          name="infectoKg"
          className="border p-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Infecto Kg"
          value={form.infectoKg}
          onChange={onChangeForm}
        />

        <input
          name="reprocesoKg"
          className="border p-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Reproceso Kg"
          value={form.reprocesoKg}
          onChange={onChangeForm}
        />

        <input
          name="desmancheKg"
          className="border p-2 md:col-span-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Desmanche Kg"
          value={form.desmancheKg}
          onChange={onChangeForm}
        />

        <button className="border px-4 py-2 md:col-span-1">
          {editId ? 'Actualizar' : 'Guardar'}
        </button>
        {editId && (
          <button
            type="button"
            className="border px-4 py-2 md:col-span-1"
            onClick={() => limpiarForm(true)}
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          className="border px-4 py-2 md:col-span-1"
          onClick={() => limpiarForm(false)}
        >
          Nuevo cliente
        </button>
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
          onClick={cargarLavados}
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
        <div>Cargando registros de lavado...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Fecha</th>
                <th className="border px-2 py-1 text-left">Cliente</th>
                <th className="border px-2 py-1 text-left">Turno</th>
                <th className="border px-2 py-1 text-right">Baja</th>
                <th className="border px-2 py-1 text-right">Alta</th>
                <th className="border px-2 py-1 text-right">Infecto</th>
                <th className="border px-2 py-1 text-right">Reproceso</th>
                <th className="border px-2 py-1 text-right">Desmanche</th>
                <th className="border px-2 py-1 text-right">Total</th>
                <th className="border px-2 py-1 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lavados.map((l) => (
                <tr key={l.id}>
                  <td className="border px-2 py-1">
                    {l.fecha
                      ? new Date(l.fecha).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                      : ''}
                  </td>
                  <td className="border px-2 py-1">
                    {l.cliente_nombre || l.cliente || ''}
                  </td>
                  <td className="border px-2 py-1">{l.turno}</td>
                  <td className="border px-2 py-1 text-right">
                    {l.bajaKg}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {l.altaKg}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {l.infectoKg}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {l.reprocesoKg}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {l.desmancheKg}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {calcularTotal(l)}
                  </td>
                  <td className="border px-2 py-1">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 underline"
                        type="button"
                        onClick={() => empezarEdicion(l)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-red-600 underline"
                        type="button"
                        onClick={() => eliminarLavado(l.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {lavados.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="border px-2 py-2 text-center text-gray-500"
                  >
                    No hay registros de lavado con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
            {lavados.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={8} className="border px-2 py-1 text-right">
                    Total kilos lavados
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {totalLavadoKg.toLocaleString('es-CO')}
                  </td>
                  <td className="border px-2 py-1"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}




