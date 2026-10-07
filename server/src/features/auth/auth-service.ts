import { badRequest, Boom, conflict } from "@hapi/boom";
import { createUserRepository, getUserByEmailRepository} from './auth-repo';
import { createStoreRepository } from '../stores/stores-repo';
import { LoginDTO, RegisterDTO, User} from './auth-type';
//El rol debe ser válido.


export const registerService = async (data: RegisterDTO):Promise<User> => {
    if (data.role !== 'consumer' && data.role !== 'store' && data.role !== 'delivery'){
        throw badRequest('Invalid role');
    
    }
    //No se puede repetir un email.

    const existingUser = await getUserByEmailRepository(data.email);
    if (existingUser){
        throw conflict('Email already registered');
        
    }
   
//Si el usuario es store, se crea su tienda automáticamente. Esto lo pide el enunciado.

    const user = await createUserRepository({
        name: data.name,
        email:data.email,
        password: data.password,
        role: data.role,
    });
    if (data.role ==='store' && data.storeName) {
        await createStoreRepository({name: data.storeName, userOwnerId: user.id});

    }
    return user;
};
//En el login, el password debe coincidir.
export const loginService = async (data:LoginDTO): Promise<User> => {
    const user = await getUserByEmailRepository(data.email);

    if(!user || user.password !== data.password){
        throw new Boom('Invalid email or password', { statusCode: 401 });
    }
    return{
        id:user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
    }
}