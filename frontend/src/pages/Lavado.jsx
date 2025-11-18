import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Lavado(){
  const [clientes, setClientes] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ cliente_id:'', fecha: new Date().toISOString(), turno:'Mañana', bajaKg:0, altaKg:0, infectoKg:0, reprocesoKg:0, desmancheKg:0 });

  useEffect(() => { api.get('/clientes').then(r=>setClientes(r.data)); listado(); }, []);
  function listado(){ api.get('/lavado').then(r=>setItems(r.data)); }

  async function onSave(e){
    e.preventDefault();
    await api.post('/lavado', form);
    setForm({ ...form, bajaKg:0, altaKg:0, infectoKg:0, reprocesoKg:0, desmancheKg:0 });
    listado();
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Registro de Lavado</h2>
      <form className="grid grid-cols-2 md:grid-cols-4 gap-2" onSubmit={onSave}>
        <select className="border p-2" value={form.cliente_id} onChange={e=>setForm({...form, cliente_id:e.target.value})} required>
          <option value="">Cliente</option>
          {clientes.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <input className="border p-2" value={form.turno} onChange={e=>setForm({...form, turno:e.target.value})} placeholder="Turno" />
        {['bajaKg','altaKg','infectoKg','reprocesoKg','desmancheKg'].map(k=> (
          <input key={k} className="border p-2" type="number" min="0" step="0.01" placeholder={k} value={form[k]} onChange={e=>setForm({...form, [k]: e.target.value})} />
        ))}
        <button className="border p-2 col-span-full">Guardar</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Turno</th>
              <th className="p-2 border">Baja</th>
              <th className="p-2 border">Alta</th>
              <th className="p-2 border">Infecto</th>
              <th className="p-2 border">Reproceso</th>
              <th className="p-2 border">Desmanche</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td className="p-2 border">{new Date(i.fecha).toLocaleString()}</td>
                <td className="p-2 border">{i.cliente}</td>
                <td className="p-2 border">{i.turno}</td>
                <td className="p-2 border">{i.bajaKg}</td>
                <td className="p-2 border">{i.altaKg}</td>
                <td className="p-2 border">{i.infectoKg}</td>
                <td className="p-2 border">{i.reprocesoKg}</td>
                <td className="p-2 border">{i.desmancheKg}</td>
                <td className="p-2 border">{i.totalKg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}