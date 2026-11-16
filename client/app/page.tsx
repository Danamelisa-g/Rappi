'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { getErrorMessage } from '@/lib/axios';

export default function LoginPage() {
  const { login } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);

      // Redirección según el rol
      if (user.role === 'consumer') router.push('/client');
      if (user.role === 'store') router.push('/store-admin');
      if (user.role === 'delivery') router.push('/delivery');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="brand">rappi</span>
        <p className="page-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-block">
            Entrar
          </button>
        </form>

        {error && <p className="alert alert-error">{error}</p>}
        <Link href="/register" className="auth-link">
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
}
