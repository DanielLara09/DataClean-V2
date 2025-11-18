import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard(){
  const [rows, setRows] = useState([]);

  const rol = localStorage.getItem('rol');
  if (rol !== 'ADMIN') return <div>No tiene permiso para ver el Dashboard.</div>;

  useEffect(() => {
    const hoy = new Date();
    const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0,10);
    const hasta = new Date(hoy.getFullYear(), hoy.getMonth()+1, 0).toISOString().slice(0,10);
    api.get(`/kpis/diario`, { params: { desde, hasta } }).then(r=>setRows(r.data));
  }, []);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">KPIs (mes actual)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[480px] border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Día</th>
              <th className="p-2 border">Kg Lavados</th>
              <th className="p-2 border">Kg Despachados</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.dia}>
                <td className="p-2 border">{r.dia}</td>
                <td className="p-2 border">{r.kg_lavados}</td>
                <td className="p-2 border">{r.kg_despachados}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}