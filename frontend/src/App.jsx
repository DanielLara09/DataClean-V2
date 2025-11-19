import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function App(){
  const nav = useNavigate();
  const [rol, setRol] = useState(localStorage.getItem('rol'));

  useEffect(() => {
    setRol(localStorage.getItem('rol'));
  }, []);

  function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    nav('/login');
  }

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr]">
      <nav className="px-4 flex items-center gap-4 border-b">
        <strong>DataClean</strong>
        {rol === 'ADMIN' && <Link to="/dashboard">Dashboard</Link>}
        {(rol === 'ADMIN' || rol === 'LAVADO') && <Link to="/lavado">Lavado</Link>}
        {(rol === 'ADMIN' || rol === 'DESPACHO') && <Link to="/despacho">Despacho</Link>}
        {rol === 'ADMIN' && <Link to="/clientes">Clientes</Link>} {/* 👈 nuevo */}
        <button className="ml-auto" onClick={logout}>Salir</button>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
