'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { api, getErrorMessage } from '@/lib/axios';
import { Order, Product, Store } from '@/lib/types';

export default function StoreAdminPage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  // Trae mi tienda, sus productos y sus órdenes
  const loadData = async () => {
    if (!user) return;
    const storeRes = await api.get(`/stores/owner/${user.id}`);
    setStore(storeRes.data);
    const productsRes = await api.get(`/stores/${storeRes.data.id}/products`);
    setProducts(productsRes.data);
    const ordersRes = await api.get(`/orders?storeId=${storeRes.data.id}`);
    setOrders(ordersRes.data);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Abrir o cerrar la tienda
  const toggleStore = async () => {
    if (!user || !store) return;
    const res = await api.patch(`/stores/${store.id}/toggle`, { userId: user.id });
    setStore(res.data);
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    try {
      await api.post(`/stores/${store.id}/products`, { name, price: Number(price) });
      setName('');
      setPrice('');
      setMessage('');
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  // prompt abre una ventanita para escribir el nuevo nombre
  const renameProduct = async (product: Product) => {
    if (!user || !store) return;
    const newName = prompt('Nuevo nombre', product.name);
    if (!newName) return;
    await api.patch(`/stores/${store.id}/products/${product.id}`, { userId: user.id, name: newName });
    loadData();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!store) return <p>Cargando...</p>;

  return (
    <main>
      <h1>{store.name}</h1>
      <button onClick={handleLogout}>Salir</button>

      <p>Estado: {store.is_open ? 'Abierta' : 'Cerrada'}</p>
      <button onClick={toggleStore}>{store.is_open ? 'Cerrar tienda' : 'Abrir tienda'}</button>

      <h2>Nuevo producto</h2>
      <form onSubmit={createProduct}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Precio" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button type="submit">Crear</button>
      </form>
      <p style={{ color: 'red' }}>{message}</p>

      <h2>Mis productos</h2>
      {products.map((p) => (
        <div key={p.id}>
          {p.name} - ${p.price} <button onClick={() => renameProduct(p)}>Cambiar nombre</button>
        </div>
      ))}

      <h2>Órdenes de mi tienda</h2>
      {orders.map((order) => (
        <div key={order.id}>
          Orden {order.id.slice(0, 8)} - {order.status}
        </div>
      ))}
    </main>
  );
}