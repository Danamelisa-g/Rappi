export interface Order {
    id: string;
    client_id: string;
    delivery_address: string | null; // es null mientras ningún domiciliario la toma
    store_id: string;
    status: string;
    created_at: Date;
    store_name: string;
}
//type de un pedido dentro de una orden 
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    product_name: string;
    price: number;
}

//Una orden junto con sus productos
export interface OrderDetail extends Order {
    items: OrderItem[];
}

// datos para crear una orden
export interface CreateOrderDTO {
    clientId: string;
    storeId: string;
    items: { productId: string; quantity: number}[];
}