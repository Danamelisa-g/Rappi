export enum OrderStatus {
    CREATED = 'Creado',
    IN_DELIVERY = 'En entrega',
    DELIVERED = 'Entregado',
}
export interface LatLng {
    lat: number;
    lng: number;
}
export interface Order {
    id: string;
    client_id: string;
    delivery_id: string | null;
    store_id: string;
    status: OrderStatus;
    created_at: Date;
    store_name: string;
    destination: LatLng;
    delivery_position: LatLng | null;
}
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    product_name: string;
    price: number;
}
export interface OrderDetail extends Order {
    items: OrderItem[];
}
export interface CreateOrderDTO {
    clientId: string;
    storeId: string;
    items: { productId: string; quantity: number }[];
    destination: LatLng;
}
export interface PositionUpdateResult {
    order: OrderDetail;
    arrived: boolean;
    distanceMeters: number;
}


