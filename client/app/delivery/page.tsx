'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { api, getErrorMessage } from '@/lib/axios';
import { Order, OrderDetail } from '@/lib/types';

export default function DeliveryPage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [available, setAvailable] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  // Órdenes disponibles y mi historial
  const loadData = async () => {
    if (!user) return;
    const availableRes = await api.get('/orders/available');
    setAvailable(availableRes.data);
    const myRes = await api.get(`/orders?deliveryId=${user.id}`);
    setMyOrders(myRes.data);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showDetail = async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`);
    setDetail(res.data);
  };

  // action es 'accept', 'release' o 'deliver'
  const changeOrder = async (orderId: string, action: string) => {
    if (!user) return;
    setError('');
    try {
      await api.patch(`/orders/${orderId}/${action}`, { deliveryId: user.id });
    } catch (err) {
      // Aquí sale "This order was already taken by another delivery"
      setError(getErrorMessage(err));
    }
    loadData();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <main>
      <h1>Domiciliario: {user.name}</h1>
      <button onClick={handleLogout}>Salir</button>
      <p style={{ color: 'red' }}>{error}</p>

      <h2>Órdenes disponibles</h2>
      {available.map((order) => (
        <div key={order.id}>
          {order.store_name}
          <button onClick={() => showDetail(order.id)}>Detalle</button>
          <button onClick={() => changeOrder(order.id, 'accept')}>Aceptar</button>
        </div>
      ))}

      {detail && (
        <div>
          <h2>Detalle de la orden</h2>
          {detail.items.map((item) => (
            <p key={item.id}>{item.quantity} x {item.product_name} (${item.price})</p>
          ))}
          <button onClick={() => setDetail(null)}>Cerrar</button>
        </div>
      )}

      <h2>Mis órdenes</h2>
      {myOrders.map((order) => (
        <div key={order.id}>
          {order.store_name} - {order.status}
          {order.status === 'in_progress' && (
            <>
              <button onClick={() => changeOrder(order.id, 'release')}>Soltar</button>
              <button onClick={() => changeOrder(order.id, 'deliver')}>Entregar</button>
            </>
          )}
        </div>
      ))}
    </main>
  );
}