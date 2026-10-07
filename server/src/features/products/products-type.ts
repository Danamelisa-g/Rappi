// definifos tipos tal cual esta la tabla de roductos 
export interface Product {
    id: string;
    name: string;
    price: number;
    store_id: string;
}
//datos para crear un producto 
export interface CreateProductDTO{
    name: string;
    price: number;
    store_id: string;

}