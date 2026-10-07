import { badRequest, Boom, conflict } from "@hapi/boom";
import { createUserRepository, getUserByEmailRepository} from './auth-repo';
import { createStoreRepository } from '../stores/stores-repo';
import { LoginDTO, RegisterDTO, User} from './auth-type';

export const registerService = async (data: RegisterDTO):Promise<User> => {
    if (data.role !== 'consumer' && data.role !== 'store' && data.role !== 'delivery'){
        throw badRequest('Invalid role');
    
    }
    const existingUser = await getUserByEmailRepository(data.email);
    if (existingUser){
        throw conflict('Email already registered');
        
    }
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