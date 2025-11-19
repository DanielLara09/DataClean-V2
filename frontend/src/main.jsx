import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Lavado from './pages/Lavado.jsx';
import Despacho from './pages/Despacho.jsx';
import Clientes from './pages/Clientes.jsx';
import Protected from './components/Protected.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Protected><App /></Protected>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="lavado" element={<Lavado />} />
        <Route path="despacho" element={<Despacho />} />
        <Route path="clientes" element={<Clientes />} /> {/* 👈 nueva ruta */}
      </Route>
    </Routes>
  </BrowserRouter>
);
