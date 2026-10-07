'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    try {
      await api.post('/auth/register', { name, email, password, role, storeName });
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main>
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="consumer">Cliente</option>
          <option value="store">Tienda</option>
          <option value="delivery">Domiciliario</option>
        </select>

        {/* Si es tienda, pedimos el nombre de la tienda */}
        {role === 'store' && (
          <input placeholder="Nombre de la tienda" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        )}

        <button type="submit">Registrarme</button>
      </form>
      <p style={{ color: 'red' }}>{error}</p>
    </main>
  );
}