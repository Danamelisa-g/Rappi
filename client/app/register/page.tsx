'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { name, email, password, role, storeName });
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="brand">rappi</span>
        <p className="page-subtitle">Crea tu cuenta</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre</label>
          <input id="name" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />

          <label htmlFor="email">Email</label>
          <input id="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="role">¿Qué tipo de cuenta?</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="consumer">🛒 Cliente</option>
            <option value="store">🏪 Tienda</option>
            <option value="delivery">🛵 Domiciliario</option>
          </select>

          {/* Si es tienda, pedimos el nombre de la tienda */}
          {role === 'store' && (
            <>
              <label htmlFor="storeName">Nombre de la tienda</label>
              <input
                id="storeName"
                placeholder="Ej: Pepe Burgers"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </>
          )}

          <button type="submit" className="btn-block">
            Registrarme
          </button>
        </form>

        {error && <p className="alert alert-error">{error}</p>}
        <Link href="/" className="auth-link">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </div>
    </div>
  );
}
