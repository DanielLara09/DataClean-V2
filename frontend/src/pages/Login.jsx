import { useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@dataclean.local');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.user.rol);

      if (data.user.rol === 'ADMIN') nav('/dashboard', { replace: true });
      else if (data.user.rol === 'LAVADO') nav('/lavado', { replace: true });
      else nav('/despacho', { replace: true });

    } catch (err) {
      setError('Credenciales inválidas');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/logo.png')",     // logo de fondo
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "30%",
        backgroundColor: "#f5f5f5",
      }}
    >

      {/* Barra superior con logo + nombre */}
      <header className="px-4 py-3 flex items-center gap-3 bg-white/95 shadow">
        <img
          src="/logo.png"
          alt="Logo Lavandería Universal"
          className="h-10 w-10 object-contain"
        />
        <span className="text-xl font-bold text-blue-700 tracking-wide">
          DataClean
        </span>
      </header>

      {/* Contenido centrado */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-md p-8 shadow-lg rounded-lg w-full max-w-sm">
          <h1 className="text-2xl font-semibold mb-4 text-center">
            Ingreso
          </h1>

          <form className="grid gap-2" onSubmit={onSubmit}>
            <input
              className="border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <input
              className="border p-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button className="border p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Entrar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
