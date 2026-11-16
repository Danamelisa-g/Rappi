// Mismo enum que el backend (server/src/features/orders-types/order.ts)
export enum OrderStatus {
    CREATED = 'Creado',
    IN_DELIVERY = 'En entrega',
    DELIVERED = 'Entregado',
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}
export interface Store {
    id: string;
    name: string;
    is_open: boolean;
    user_owner_id: string;
}
export interface Product {
    id: string;
    name: string;
    price: number;
    store_id: string;
}
export interface Order {
    id: string;
    client_id: string;
    delivery_id: string | null;
    store_id: string;
    status: OrderStatus;
    store_name: string;
    created_at: string;
    destination: LatLng;
    delivery_position: LatLng | null;
}
export interface OrderItem {
    id: string;
    quantity: number;
    product_name: string;
    price: number;
}
export interface OrderDetail extends Order {
    items: OrderItem[];
}

// Respuesta de PATCH /orders/:id/position
export interface PositionUpdateResult {
    order: OrderDetail;
    arrived: boolean;
    distanceMeters: number;
}

// Payloads de Supabase Broadcast
export interface StatusChangePayload {
    orderId: string;
    status: OrderStatus;
    delivery_position?: LatLng | null;
}
