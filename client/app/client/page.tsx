'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { api, getErrorMessage } from '@/lib/axios';
import { LatLng, Order, OrderStatus, Product, StatusChangePayload, Store } from '@/lib/types';
import { broadcast, listen, orderTopic, ORDERS_TOPIC, storeTopic } from '@/lib/supabase';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import StatusBadge from '@/components/StatusBadge';
import Toast from '@/components/Toast';


const DEFAULT_CENTER: LatLng = { lat: 3.4516, lng: -76.532 };

const formatPrice = (value: number) => `$${value.toLocaleString('es-CO')}`;

export default function ClientPage() {
  const { user, loading } = useUser();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');


  const loadData = async () => {
    if (!user) return;
    try {const storesRes = await api.get('/stores');setStores(storesRes.data);const ordersRes = await api.get(`/orders?clientId=${user.id}`);setOrders(ordersRes.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const activeIds = orders.filter((o) => o.status !== OrderStatus.DELIVERED).map((o) => o.id).join(',');

  useEffect(() => {
    if (!activeIds) return;

    const unsubscribers = activeIds.split(',').map((orderId) =>
      listen(orderTopic(orderId), (event, payload) => {
        if (event === 'position-update') {const position = payload as LatLng;
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, delivery_position: position } : o)));
        }

        if (event === 'status-change') {
          const change = payload as StatusChangePayload;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId
                ? { ...o, status: change.status, delivery_position: change.delivery_position ?? o.delivery_position }
                : o,
            ),
          );

          if (change.status === OrderStatus.IN_DELIVERY) {
            setToast(' Un repartidor aceptó tu pedido. ¡Síguelo en el mapa!');
          }
          
          if (change.status === OrderStatus.DELIVERED) {
            setToast(' ¡Tu repartidor llegó! Tu pedido fue entregado.');
          }
        }
      }),
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [activeIds]);

  // Pantalla 2: al elegir tienda traemos sus productos
  const selectStore = async (storeId: string) => {
    try {
      const storeRes = await api.get(`/stores/${storeId}`);
      const productsRes = await api.get(`/stores/${storeId}/products`);
      setSelectedStore(storeRes.data);
      setProducts(productsRes.data);
      setQuantities({});
      setDestination(null);
      setMessage('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  
  const items = products
    .filter((p) => quantities[p.id] > 0)
    .map((p) => ({ productId: p.id, quantity: quantities[p.id] }));

  const total = products.reduce((sum, p) => sum + p.price * (quantities[p.id] || 0), 0);

  const createOrder = async () => {
    if (!user || !selectedStore) return;
    setMessage('');

    if (items.length === 0) {
      setMessage('Elige al menos un producto');
      return;
    }

    if (!destination) {
      setMessage('Haz click en el mapa para elegir el punto de entrega');
      return;
    }

    try {
      const res = await api.post<Order>('/orders', {
        clientId: user.id,storeId: selectedStore.id,items,destination, });
      setToast('¡Pedido creado! Espera a que un repartidor lo acepte.');setDestination(null);setQuantities({});setSelectedStore(null);broadcast(storeTopic(res.data.store_id), 'status-change', { orderId: res.data.id, status: res.data.status });broadcast(ORDERS_TOPIC, 'orders-changed', { orderId: res.data.id });
      loadData();
    } catch (err) {
      
      setMessage(getErrorMessage(err));
    }
  };

  const closeToast = () => setToast('');

  if (loading) return <p className="empty">Cargando...</p>;
  if (!user) return <Link href="/" className="auth-link">Inicia sesión</Link>;


  if (user.role !== 'consumer') {
    return (
      <p className="empty">
        Esta página es solo para clientes. <Link href="/">Inicia sesión con otra cuenta</Link>
      </p>
    );
  }

  return (
    <>
      <Header role="Cliente" />
      {toast && <Toast message={toast} onClose={closeToast} />}

      <div className="container">
        <h1 className="page-title">Hola, {user.name} </h1>
        <p className="page-subtitle">¿Qué quieres pedir hoy?</p>
        {error && <p className="alert alert-error">{error}</p>}

      
        <section className="section">
          <h2 className="section-title">Tiendas abiertas</h2>
          {stores.length === 0 && <p className="empty">No hay tiendas abiertas en este momento</p>}
          <div className="store-grid">
            {stores.map((store) => (
              <div className={`store-card ${selectedStore?.id === store.id ? 'selected' : ''}`} key={store.id}>
                
                <span className="row-title">{store.name}</span>
                <button onClick={() => selectStore(store.id)}>Ver productos</button>
              </div>
            ))}
          </div>
        </section>

      
        {selectedStore && (
          <section className="section">
            <h2 className="section-title">Productos de {selectedStore.name}</h2>
            <div className="list">
              {products.length === 0 && <p className="empty">Esta tienda aún no tiene productos</p>}
              {products.map((p) => (
                <div className="row" key={p.id}>
                  <div>
                    <div className="row-title">{p.name}</div>
                    <div className="row-sub">{formatPrice(p.price)}</div>
                  </div>
                  <input
                    className="qty-input"
                    type="number"
                    min="0"
                    value={quantities[p.id] || 0}
                    onChange={(e) => setQuantities({ ...quantities, [p.id]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>

            <h2 className="section-title" style={{ marginTop: 22 }}>Punto de entrega</h2>
            <p className="hint">Haz click en el mapa para elegir dónde quieres recibir tu pedido.</p>
            <div className="map-box">
              <MapView
                center={destination ?? DEFAULT_CENTER}
                zoom={15}
                onMapClick={setDestination}
                markers={destination ? [{ kind: 'destination', position: destination, label: 'Punto de entrega' }] : []}
              />
            </div>
            <p className="hint">
              {destination
                ? `Destino elegido: ${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`
                : 'Aún no has elegido un destino'}
            </p>

            <div className="total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Validación en frontend: si la tienda está cerrada el botón se bloquea */}
            <button
              className="btn-block"
              onClick={createOrder}
              disabled={!selectedStore.is_open || !destination || items.length === 0}
            >
              {selectedStore.is_open ? 'Crear pedido' : 'Tienda cerrada'}
            </button>
            {message && <p className="alert alert-error">{message}</p>}
          </section>
        )}
        <section className="section">
          <h2 className="section-title"> Mis pedidos</h2>
          {orders.length === 0 && <p className="empty">Todavía no has hecho pedidos</p>}
          <div className="list">
            {orders.map((order) => (
              <div className="row" key={order.id} style={{ display: 'block' }}>
                <div className="store-status">
                  <div>
                    <div className="row-title">{order.store_name}</div>
                    <div className="row-sub">Pedido #{order.id.slice(0, 8)}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Mapa en vivo cuando un repartidor aceptó el pedido */}
                {order.status === OrderStatus.IN_DELIVERY && (
                  <>
                    <p className="hint"> Tu repartidor va en camino (se actualiza en vivo):</p>
                    <div className="map-box">
                      <MapView
                        center={order.delivery_position ?? order.destination}
                        follow={order.delivery_position}
                        markers={[
                          { kind: 'destination', position: order.destination, label: 'Tu punto de entrega' },
                          ...(order.delivery_position
                            ? [{ kind: 'delivery' as const, position: order.delivery_position, label: 'Repartidor' }]
                            : []),
                        ]}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
