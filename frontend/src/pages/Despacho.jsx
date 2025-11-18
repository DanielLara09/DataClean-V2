import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Despacho(){
  const [clientes, setClientes] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ cliente_id:'', fecha:new Date().toISOString(), turno:'Tarde', kilosDespachados:0, estado:'PENDIENTE' });

  useEffect(() => { api.get('/clientes').then(r=>setClientes(r.data)); listado(); }, []);
  function listado(){ api.get('/despacho').then(r=>setItems(r.data)); }

  async function onSave(e){
    e.preventDefault();
    await api.post('/despacho', form);
    setForm({ ...form, kilosDespachados:0 });
    listado();
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Registro de Despacho</h2>
      <form className="grid grid-cols-2 md:grid-cols-5 gap-2" onSubmit={onSave}>
        <select className="border p-2" value={form.cliente_id} onChange={e=>setForm({...form, cliente_id:e.target.value})} required>
          <option value="">Cliente</option>
          {clientes.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input className="border p-2" value={form.turno} onChange={e=>setForm({...form, turno:e.target.value})} placeholder="Turno" />
        <input className="border p-2" type="number" min="0" step="0.01" value={form.kilosDespachados} onChange={e=>setForm({...form, kilosDespachados:e.target.value})} placeholder="Kg" />
        <select className="border p-2" value={form.estado} onChange={e=>setForm({...form, estado:e.target.value})}>
          <option>PENDIENTE</option>
          <option>ENTREGADO</option>
          <option>CERRADO</option>
        </select>
        <button className="border p-2 col-span-full">Guardar</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Turno</th>
              <th className="p-2 border">Kg</th>
              <th className="p-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td className="p-2 border">{new Date(i.fecha).toLocaleString()}</td>
                <td className="p-2 border">{i.cliente}</td>
                <td className="p-2 border">{i.turno}</td>
                <td className="p-2 border">{i.kilosDespachados}</td>
                <td className="p-2 border">{i.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}