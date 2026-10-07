export type Role = 'consumer' | 'store' | 'delivery';
export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}
export interface UserWithPassword extends User {
    password: string;
}
export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role: Role;
    storeName?: string;
}
export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    role: Role;
}
export interface LoginDTO {
    email: string;
    password: string;
}