import { Request,Response,NextFunction } from "express";
import userModel,{IUser} from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
require("dotenv").config()


//register user
interface IRegisterationBody{
    name :string
    email:string
    password:string
    avatar?:string
   
}
export const registrationUser =CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {name,email,password,}=req.body
        const isEmailIsExist = await userModel.findOne({email})
        if(isEmailIsExist){
            return next(new ErrorHandler("Email is already exists",400))
        }
        const user:IRegisterationBody={
            name,
            email,
            password,

        }
        const activationToken =createActivationToken(user)
        const activationCode= activationToken.activationCode
        
    } catch (error:any) {
       return next(new ErrorHandler(error.message,400)) 
    }
})
interface IActivationToken{
token :string,
activationCode:String
}

export const createActivationToken =(user:any):IActivationToken=>{
    const activationCode =Math.floor(1000+Math.random()*9000).toString();
    const token = jwt.sign({
        user,activationCode
    },process.env.ACTIVATION_SECRET as Secret,{
        expiresIn:"5m"
    });
return {token,activationCode}
}
