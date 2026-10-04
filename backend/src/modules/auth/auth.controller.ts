import type { Request, Response } from 'express'; import { register,login,logout,getMe } from './auth.service';
function auth(req:Request){if(!req.userId||!req.sessionId)throw new Error('Authentication context missing');return {userId:req.userId,sessionId:req.sessionId};}
export async function registerController(req:Request,res:Response){res.status(201).json({success:true,data:await register(req.body.email,req.body.password)});}
export async function loginController(req:Request,res:Response){res.json({success:true,data:await login(req.body.email,req.body.password)});}
export async function logoutController(req:Request,res:Response){await logout(auth(req).sessionId);res.json({success:true,data:{loggedOut:true}});}
export async function meController(req:Request,res:Response){res.json({success:true,data:await getMe(auth(req).userId)});}
