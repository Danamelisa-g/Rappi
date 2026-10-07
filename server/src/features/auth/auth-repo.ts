//capa que habla con las bases de datos
import { pool } from '../../db/db';
//tipados 
import { User, CreateUserDTO, UserWithPassword } from './auth-type';
//recibe los datos del usuarios y los guarda en la users
export const createUserRepository = async (user: CreateUserDTO): Promise<User> => {
    const result =await pool.query<User>(
        `INSERT INTO public.users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
        [user.name, user.email, user.password, user.role],
    );

    return result.rows[0];
};
//se busca el ususario por su email sin no lohay unfiend
 export const getUserByEmailRepository = async (email:string): Promise<UserWithPassword | undefined> =>{
    const result = await pool.query<UserWithPassword>(
'SELECT id, name, email, password, role FROM public.users WHERE email = $1', 
 [email],
 );
 return result.rows[0];
}

//devuelve al usuario sin password utilizado para revisar el rol de quien hace la peticion
 export const getUserByIdRepository = async (id: string): Promise<User | undefined> => {
  const result = await pool.query<User>(
    'SELECT id, name, email, role FROM public.users WHERE id = $1',
    [id],
  );

  return result.rows[0];
};