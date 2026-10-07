import { pool } from '../../db/db';
import { User, CreateUserDTO, UserWithPassword } from './auth-type';

export const createUserRepository = async (user: CreateUserDTO): Promise<User> => {
    const result =await pool.query<User>(
        `INSERT INTO public.users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
        [user.name, user.email, user.password, user.role],
    );

    return result.rows[0];
};

export const getUserByEmailRepository = async (email:string): Promise<UserWithPassword | undefined> =>{
    const result = await pool.query<UserWithPassword>(
'SELECT id, name, email, password, role FROM public.users WHERE email = $1', 
 [email],
 );
 return result.rows[0];
}
export const getUserByIdRepository = async (id: string): Promise<User | undefined> => {
  const result = await pool.query<User>(
    'SELECT id, name, email, role FROM public.users WHERE id = $1',
    [id],
  );

  return result.rows[0];
};