import { NextFunction, Request, Response } from "express";

export const CatchAsyncError=(theFunc:any)=>(req:Request,res:Response,next:NextFunction)=>{
    Promise.resolve(theFunc(req,res,next)).catch(next);
};
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string; }>;
    comparePassword: (password: string) => Promise<boolean>;
}
