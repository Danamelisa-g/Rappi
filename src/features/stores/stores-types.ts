// Una tienda tal como está en la tabla stores
export interface Store {
  id: string;
  name: string;
  is_open: boolean;
  user_owner_id: string;
}

// Datos necesarios para crear una tienda (los usa el registro)
export interface CreateStoreDTO {
  name: string;
  userOwnerId: string;
}