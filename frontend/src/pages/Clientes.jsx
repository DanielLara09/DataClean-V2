import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    identificacion: '',
    direccion: '',
    telefono: '',
    correo: '',
    ciudad: 'Barranquilla',
  });

  async function cargarClientes() {
    try {
      setCargando(true);
      const { data } = await api.get('/clientes');
      setClientes(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los clientes');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function limpiarForm() {
    setEditingId(null);
    setForm({
      nombre: '',
      identificacion: '',
      direccion: '',
      telefono: '',
      correo: '',
      ciudad: 'Barranquilla',
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (!form.nombre.trim()) {
        setError('El nombre es obligatorio');
        return;
      }

      if (editingId) {
        await api.put(`/clientes/${editingId}`, form);
      } else {
        await api.post('/clientes', form);
      }

      limpiarForm();
      await cargarClientes();
      setError('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('No tiene permiso para crear o editar clientes');
      } else {
        setError('Error al guardar el cliente');
      }
    }
  }

  function onEdit(cliente) {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      identificacion: cliente.identificacion || '',
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      ciudad: cliente.ciudad || 'Barranquilla',
    });
  }

  async function onDelete(id) {
    if (!window.confirm('¿Seguro que desea eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      await cargarClientes();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('No tiene permiso para eliminar clientes');
      } else if (err.response?.status === 409) {
        setError('No se puede eliminar: el cliente tiene registros asociados');
      } else {
        setError('Error al eliminar el cliente');
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Gestión de Clientes</h1>

      <form onSubmit={onSubmit} className="grid gap-2 mb-6 md:grid-cols-3">
        <input
          className="border p-2 col-span-3 md:col-span-2"
          name="nombre"
          placeholder="Nombre del cliente *"
          value={form.nombre}
          onChange={onChange}
        />
        <input
          className="border p-2"
          name="identificacion"
          placeholder="NIT / Identificación"
          value={form.identificacion}
          onChange={onChange}
        />
        <input
          className="border p-2"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={onChange}
        />
        <input
          className="border p-2"
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={onChange}
        />
        <input
          className="border p-2 col-span-2"
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={onChange}
        />
        <input
          className="border p-2"
          name="ciudad"
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={onChange}
        />

        <div className="col-span-3 flex gap-2 mt-2">
          <button className="border px-4 py-2">
            {editingId ? 'Actualizar' : 'Guardar'}
          </button>
          {editingId && (
            <button
              type="button"
              className="border px-4 py-2"
              onClick={limpiarForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

      {cargando ? (
        <div>Cargando clientes...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Nombre</th>
                <th className="border px-2 py-1 text-left">Identificación</th>
                <th className="border px-2 py-1 text-left">Teléfono</th>
                <th className="border px-2 py-1 text-left">Correo</th>
                <th className="border px-2 py-1 text-left">Ciudad</th>
                <th className="border px-2 py-1 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className="border px-2 py-1">{c.nombre}</td>
                  <td className="border px-2 py-1">{c.identificacion}</td>
                  <td className="border px-2 py-1">{c.telefono}</td>
                  <td className="border px-2 py-1">{c.correo}</td>
                  <td className="border px-2 py-1">{c.ciudad}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="text-blue-600 mr-2"
                      type="button"
                      onClick={() => onEdit(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600"
                      type="button"
                      onClick={() => onDelete(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border px-2 py-2 text-center text-gray-500"
                  >
                    No hay clientes registrados.
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
