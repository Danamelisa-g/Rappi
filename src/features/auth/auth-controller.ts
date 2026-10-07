import Boom from "@hapi/boom";
import { Request, Response } from 'express';
import { loginService, registerService } from "./auth-service";



export const registerController = async (req:Request, res: Response) =>{
    const { name,email,password,role,storeName } = req.body;

    if(!name){
        throw Boom.badRequest('Name is required');
    }
    if(!email){
        throw Boom.badRequest('Email is required');
    }
    if(!password){
        throw Boom.badRequest('Password is required');
    }
    if(!role){
        throw Boom.badRequest('Role is required');
    }
    if(role ==='store'&& !storeName){
        throw Boom.badRequest('Store name is required for store role');
    }

    const user = await registerService({name, email, password, role, storeName});
    res.status(201).json(user);

};
export const loginController =async (req:Request, res: Response) =>{
    const { email, password } = req.body;

  if (!email) {
    throw Boom.badRequest('Email is required');
  }

  if (!password) {
    throw Boom.badRequest('Password is required');
  }

  const user = await loginService({ email, password });

  res.status(200).json(user);
};

