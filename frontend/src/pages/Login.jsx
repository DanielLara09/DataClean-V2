import { useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email, setEmail] = useState('admin@dataclean.local');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const nav = useNavigate();

async function onSubmit(e){
    e.preventDefault();
    try{
      const { data } = await api.post('/auth/login', { email, password });
      // data = { token, user: { id, nombre, rol, email } }
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.user.rol);

      if (data.user.rol === 'ADMIN') nav('/dashboard', { replace: true });
      else if (data.user.rol === 'LAVADO') nav('/lavado', { replace: true });
      else nav('/despacho', { replace: true });
    }catch(err){
      setError('Credenciales inválidas');
    }
  }


  return (
    <div className="max-w-sm mx-auto mt-24">
      <h1 className="text-2xl font-semibold mb-4">Ingreso</h1>
      <form className="grid gap-2" onSubmit={onSubmit}>
        <input className="border p-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="border p-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="border p-2">Entrar</button>
      </form>
    </div>
  );
}