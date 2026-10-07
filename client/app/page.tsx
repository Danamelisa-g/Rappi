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
    <main>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
      <p style={{ color: 'red' }}>{error}</p>
      <Link href="/register">Crear cuenta</Link>
    </main>
  );
}