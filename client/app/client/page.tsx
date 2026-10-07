'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { api, getErrorMessage } from '@/lib/axios';
import { Order, Product, Store } from '@/lib/types';

export default function ClientPage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');

  // Pantalla 1 y 3: tiendas abiertas y mis órdenes
  const loadData = async () => {
    if (!user) return;
    const storesRes = await api.get('/stores');
    setStores(storesRes.data);
    const ordersRes = await api.get(`/orders?clientId=${user.id}`);
    setOrders(ordersRes.data);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Pantalla 2: al elegir tienda traemos sus productos
  const selectStore = async (storeId: string) => {
    const storeRes = await api.get(`/stores/${storeId}`);
    const productsRes = await api.get(`/stores/${storeId}/products`);
    setSelectedStore(storeRes.data);
    setProducts(productsRes.data);
    setQuantities({});
  };

  const createOrder = async () => {
    if (!user || !selectedStore) return;

    // Solo los productos con cantidad mayor a 0
    const items = products
      .filter((p) => quantities[p.id] > 0)
      .map((p) => ({ productId: p.id, quantity: quantities[p.id] }));

    try {
      await api.post('/orders', { clientId: user.id, storeId: selectedStore.id, items });
      setMessage('Orden creada');
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <main>
      <h1>Hola, {user.name}</h1>
      <button onClick={handleLogout}>Salir</button>

      <h2>Tiendas abiertas</h2>
      {stores.map((store) => (
        <div key={store.id}>
          {store.name} <button onClick={() => selectStore(store.id)}>Ver productos</button>
        </div>
      ))}

      {selectedStore && (
        <div>
          <h2>Productos de {selectedStore.name}</h2>
          {products.map((p) => (
            <div key={p.id}>
              {p.name} - ${p.price}
              <input
                type="number"
                min="0"
                value={quantities[p.id] || 0}
                onChange={(e) => setQuantities({ ...quantities, [p.id]: Number(e.target.value) })}
              />
            </div>
          ))}

          {/* Validación en frontend: si está cerrada el botón se bloquea */}
          <button onClick={createOrder} disabled={!selectedStore.is_open}>
            {selectedStore.is_open ? 'Crear orden' : 'Tienda cerrada'}
          </button>
          <p>{message}</p>
        </div>
      )}

      <h2>Mis órdenes</h2>
      {orders.map((order) => (
        <div key={order.id}>
          {order.store_name} - {order.status}
        </div>
      ))}
    </main>
  );
}
