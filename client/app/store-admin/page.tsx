'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { api, getErrorMessage } from '@/lib/axios';
import { Order, OrderStatus, Product, Store } from '@/lib/types';
import { listen, storeTopic } from '@/lib/supabase';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';

const formatPrice = (value: number) => `$${value.toLocaleString('es-CO')}`;

export default function StoreAdminPage() {
  const { user, loading } = useUser();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    if (!user) return;
    try {
      const storeRes = await api.get(`/stores/owner/${user.id}`);
      setStore(storeRes.data);
      const productsRes = await api.get(`/stores/${storeRes.data.id}/products`);
      setProducts(productsRes.data);
      const ordersRes = await api.get(`/orders?storeId=${storeRes.data.id}`);
      setOrders(ordersRes.data);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const storeId = store?.id;

  useEffect(() => {
    if (!storeId) return;
    return listen(storeTopic(storeId), async (event) => {
      if (event !== 'status-change') return;
      const ordersRes = await api.get(`/orders?storeId=${storeId}`);
      setOrders(ordersRes.data);
    });
  }, [storeId]);

  const toggleStore = async () => {
    if (!user || !store) return;
    const res = await api.patch(`/stores/${store.id}/toggle`, { userId: user.id });
    setStore(res.data);
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    try {
      await api.post(`/stores/${store.id}/products`, { name, price: Number(price) });setName('');setPrice('');setMessage('');loadData();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };


  const renameProduct = async (product: Product) => {
    if (!user || !store) return;
    const newName = prompt('Nuevo nombre', product.name);
    if (!newName) return;
    await api.patch(`/stores/${store.id}/products/${product.id}`, { userId: user.id, name: newName });
    loadData();
  };

  
  const count = (status: OrderStatus) => orders.filter((o) => o.status === status).length;

  if (loading) return <p className="empty">Cargando...</p>;
  if (!user) return <Link href="/" className="auth-link">Inicia sesión</Link>;

 
  if (user.role !== 'store') {
    return (
      <p className="empty">
        Esta página es solo para tiendas. <Link href="/">Inicia sesión con otra cuenta</Link>
      </p>
    );
  }
  if (!store) return <p className="empty">{message || 'Cargando tienda...'}</p>;

  return (
    <>
      <Header role="Tienda" />

      <div className="container">
        <h1 className="page-title"> {store.name}</h1>
        <p className="page-subtitle">Administra tu tienda y revisa tus pedidos</p>

        
        <section className="section store-status">
          <div>
            <div className="row-sub">Estado de la tienda</div>
            <div className="row-title">
              <span className={`dot ${store.is_open ? 'dot-open' : 'dot-closed'}`} />
              {store.is_open ? 'Abierta' : 'Cerrada'}
            </div>
          </div>
          <button className={store.is_open ? 'btn-outline' : ''} onClick={toggleStore}>
            {store.is_open ? 'Cerrar tienda' : 'Abrir tienda'}
          </button>
        </section>

        <div className="two-columns">
          {/* Productos */}
          <section className="section">
            <h2 className="section-title">+ Nuevo producto</h2>
            <form className="inline-form" onSubmit={createProduct}>
              <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
              <input placeholder="Precio" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              <button type="submit">Crear</button>
            </form>
            {message && <p className="alert alert-error">{message}</p>}

            <h2 className="section-title" style={{ marginTop: 22 }}> Mis productos</h2>
            <div className="list">
              {products.length === 0 && <p className="empty">Aún no tienes productos</p>}
              {products.map((p) => (
                <div className="row" key={p.id}>
                  <div>
                    <div className="row-title">{p.name}</div>
                    <div className="row-sub">{formatPrice(p.price)}</div>
                  </div>
                  <button className="btn-light" onClick={() => renameProduct(p)}>
                    ✏️ Cambiar nombre
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title"> Pedidos</h2>
            <p className="hint">
              Creados: {count(OrderStatus.CREATED)} · En entrega: {count(OrderStatus.IN_DELIVERY)} · Entregados:{' '}
              {count(OrderStatus.DELIVERED)}
            </p>
            <div className="list">
              {orders.length === 0 && <p className="empty">Todavía no hay pedidos</p>}
              {orders.map((order) => (
                <div className="row" key={order.id}>
                  <div>
                    <div className="row-title">Pedido #{order.id.slice(0, 8)}</div>
                    <div className="row-sub">{new Date(order.created_at).toLocaleString('es-CO')}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
