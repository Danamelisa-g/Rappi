export interface Store {
    id: string;
    name: string;
    isOpen: boolean;
    userOwnerId: string;
}
export interface CreateStoreDTO {
    name: string;
    userOwnerId: string;
}