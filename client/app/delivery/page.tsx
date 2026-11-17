'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { api, getErrorMessage } from '@/lib/axios';
import { LatLng, Order, OrderDetail, OrderStatus, PositionUpdateResult } from '@/lib/types';
import { broadcast, listen, orderTopic, ORDERS_TOPIC, storeTopic } from '@/lib/supabase';
import MapView from '@/components/MapView';
import StatusBadge from '@/components/StatusBadge';
import Header from '@/components/Header';

const STEP = 0.00005; 
const THROTTLE_MS = 1000; 

export default function DeliveryPage() {
  const { user, loading } = useUser();
  const [available, setAvailable] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPosition = useRef<LatLng | null>(null);
  const activeOrderRef = useRef<OrderDetail | null>(null);

const loadData = async () => {
    if (!user) return;
    try {const availableRes = await api.get('/orders/available');setAvailable(availableRes.data);const myRes = await api.get(`/orders?deliveryId=${user.id}`);setMyOrders(myRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  
  useEffect(() => listen(ORDERS_TOPIC, () => loadData()), [user]);

  const startTracking = (order: OrderDetail) => {
    activeOrderRef.current = order;
    pendingPosition.current = order.delivery_position;
    setActiveOrder(order);
    setPosition(order.delivery_position);
    setDistance(null);
  };

  
  const notifyStatus = (order: Order) => {
    const payload = { orderId: order.id, status: order.status, delivery_position: order.delivery_position };
    broadcast(orderTopic(order.id), 'status-change', payload);
    broadcast(storeTopic(order.store_id), 'status-change', payload);
    broadcast(ORDERS_TOPIC, 'orders-changed', { orderId: order.id });
  };

  const showDetail = async (orderId: string) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setDetail(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Aceptar: status -> "En entrega" y se muestra el mapa
  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    setError('');
    setInfo('');
    try {
      const res = await api.patch<OrderDetail>(`/orders/${orderId}/accept`, { deliveryId: user.id });
      startTracking(res.data);
      notifyStatus(res.data);
    } catch (err) {
      // Aquí sale "This order was already taken by another delivery"
      setError(getErrorMessage(err));
    }
    loadData();
  };

  // Retomar un pedido que ya estaba "En entrega"
  const resumeOrder = async (orderId: string) => {
    try {
      const res = await api.get<OrderDetail>(`/orders/${orderId}`);
      startTracking(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const releaseOrder = async (orderId: string) => {
    if (!user) return;
    setError('');
    try {
      const res = await api.patch<OrderDetail>(`/orders/${orderId}/release`, { deliveryId: user.id });
      notifyStatus(res.data);
      if (activeOrderRef.current?.id === orderId) {
        activeOrderRef.current = null;
        setActiveOrder(null);
        setPosition(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
    loadData();
  };

 
  const updatePosition = useCallback(
    async (next: LatLng) => {
      const order = activeOrderRef.current;
      if (!user || !order) return;

      try {
        const res = await api.patch<PositionUpdateResult>(`/orders/${order.id}/position`, {
          deliveryId: user.id,
          lat: next.lat,
          lng: next.lng,
        });

        
        broadcast(orderTopic(order.id), 'position-update', { lat: next.lat, lng: next.lng });
        setDistance(res.data.distanceMeters);

        if (res.data.arrived) {
          
          activeOrderRef.current = res.data.order;
          setActiveOrder(res.data.order);
          setInfo(' ¡Llegaste al destino! El pedido quedó como "Entregado".');
          notifyStatus(res.data.order);
          loadData();
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
    [user],
  );

  const isMoving = activeOrder?.status === OrderStatus.IN_DELIVERY;

  useEffect(() => {
    if (!isMoving) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const current = pendingPosition.current;
      if (!current) return;
      let { lat, lng } = current;
         switch (e.key) {case 'ArrowUp':lat += STEP;break;
        case 'ArrowDown':lat -= STEP;break;
        case 'ArrowLeft':lng -= STEP;break;
        case 'ArrowRight':lng += STEP;break;
        default:
          return;
      }

      e.preventDefault(); 

      
      pendingPosition.current = { lat, lng };
      setPosition({ lat, lng });
      if (throttleRef.current) return;
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null; // liberar para el siguiente ciclo
        if (pendingPosition.current) updatePosition(pendingPosition.current); // API call + broadcast
      }, THROTTLE_MS);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
        throttleRef.current = null;
      }
    };}, [isMoving, updatePosition]);

  const closeMap = () => {
    activeOrderRef.current = null;
    setActiveOrder(null);
    setPosition(null);
    setInfo('');
  };

  if (loading) return <p className="empty">Cargando...</p>;
  if (!user) return <Link href="/" className="auth-link">Inicia sesión</Link>;

  if (user.role !== 'delivery') {
    return (
      <p className="empty">
        Esta página es solo para domiciliarios. <Link href="/">Inicia sesión con otra cuenta</Link>
      </p>
    );
  }

  return (
    <>
      <Header role="Domiciliario" />

      <div className="container">
        <h1 className="page-title">Hola, {user.name} </h1>
        <p className="page-subtitle">Acepta un pedido y llévalo hasta el cliente</p>
        {error && <p className="alert alert-error">{error}</p>}

        {activeOrder && (
          <section className="section">
            <div className="store-status">
              <h2 className="section-title">Pedido de {activeOrder.store_name}</h2>
              <StatusBadge status={activeOrder.status} />
            </div>

            {isMoving && (
              <p className="hint">
                Usa las flechas <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> para llevar el domicilio hasta la ubicacion. A
                menos de 5 metros el pedido se entrega automáticamente.
              </p>
            )}

            <div className="map-box">
              <MapView
                center={position ?? activeOrder.destination}
                follow={position}
                height={420}
                markers={[
                  { kind: 'destination', position: activeOrder.destination, label: 'Destino del cliente' },
                  ...(position ? [{ kind: 'delivery' as const, position, label: 'Tú' }] : []),
                ]}
              />
            </div>

            {distance !== null && (
              <p>
                Distancia al destino: <span className="distance">{distance.toFixed(1)} m</span>
              </p>
            )}
            {info && <p className="alert alert-success">{info}</p>}

            {isMoving ? (
              <button className="btn-outline" onClick={() => releaseOrder(activeOrder.id)}>
                Soltar pedido
              </button>
            ) : (
              <button className="btn-light" onClick={closeMap}>
                Cerrar mapa
              </button>
            )}
          </section>
        )}

        <div className="two-columns">
          <section className="section">
            <h2 className="section-title">Pedidos disponibles</h2>
            {available.length === 0 && <p className="empty">No hay pedidos disponibles</p>}
            <div className="list">
              {available.map((order) => (
                <div className="row" key={order.id}>
                  <div>
                    <div className="row-title">{order.store_name}</div>
                    <div className="row-sub">Pedido #{order.id.slice(0, 8)}</div>
                  </div>
                  <div className="row-actions">
                    <button className="btn-light" onClick={() => showDetail(order.id)}>
                      Detalle
                    </button>
                    <button onClick={() => acceptOrder(order.id)} disabled={isMoving}>
                      Aceptar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {detail && (
              <div className="row" style={{ display: 'block', marginTop: 14 }}>
                <div className="row-title">Detalle de {detail.store_name}</div>
                {detail.items.map((item) => (
                  <p className="row-sub" key={item.id}>
                    {item.quantity} x {item.product_name} (${item.price})
                  </p>
                ))}
                <button className="btn-light" onClick={() => setDetail(null)}>
                  Cerrar
                </button>
              </div>
            )}
          </section>
          <section className="section">
            <h2 className="section-title"> Mis entregas</h2>
            {myOrders.length === 0 && <p className="empty">Aún no has tomado pedidos</p>}
            <div className="list">
              {myOrders.map((order) => (
                <div className="row" key={order.id}>
                  <div>
                    <div className="row-title">{order.store_name}</div>
                    <StatusBadge status={order.status} />
                  </div>
                  {order.status === OrderStatus.IN_DELIVERY && activeOrder?.id !== order.id && (
                    <div className="row-actions">
                      <button onClick={() => resumeOrder(order.id)}>Ver mapa</button>
                      <button className="btn-outline" onClick={() => releaseOrder(order.id)}>
                        Soltar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
