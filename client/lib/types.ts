export interface User {
    id:string;
    name: string;
    email: string;
    role: string;

}
export interface Store {
    id:string;
    name: string;
    is_open: boolean;
    user_owner_id:string;
}
export interface Product{
    id: string;
    name: string;
    price: number;
    store_id:string;
}
export interface Order{
    id: string;
    delivery_id: string | null;
    store_id: string;
    status: string;
    store_name: string;
}
export interface OrderItem{
    id: string;
    quantity: number;
    product_name: string;
    price: number;
}
export interface OrderDetail extends Order {
  items: OrderItem[];
}