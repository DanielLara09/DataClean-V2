import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function App() {
  const navigate = useNavigate();
  const [rol, setRol] = useState(localStorage.getItem('rol'));

  useEffect(() => {
    setRol(localStorage.getItem('rol'));
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/login');
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/logo.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '20%',   
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Barra superior común a todas las páginas internas */}
      <nav className="px-4 py-3 flex items-center gap-3 bg-white/95 shadow">
        {/* Logo esquina superior izquierda */}
        <img
          src="/logo.png"
          alt="Logo Lavandería Universal"
          className="h-10 w-10 object-contain"
        />

        {/* Nombre del sistema */}
        <span className="text-xl font-bold text-blue-700 tracking-wide">
          DataClean
        </span>

        {/* Links según rol */}
        <div className="flex items-center gap-3 ml-6 text-sm">
          {rol === 'ADMIN' && <Link to="/dashboard">Dashboard</Link>}
          {(rol === 'ADMIN' || rol === 'LAVADO') && <Link to="/lavado">Lavado</Link>}
          {(rol === 'ADMIN' || rol === 'DESPACHO') && <Link to="/despacho">Despacho</Link>}
          {rol === 'ADMIN' && <Link to="/clientes">Clientes</Link>}
        </div>

        <button
          onClick={logout}
          className="ml-auto text-sm text-red-600 hover:underline"
        >
          Salir
        </button>
      </nav>

      {/* Contenido de cada página */}
      <main className="flex-1 p-4">
        {/* Caja blanca semitransparente para que el logo de fondo no moleste la lectura */}
        <div className="bg-white/95 rounded-lg shadow-sm p-4 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
