import { Request,Response,NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import { generateLast12MonthData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/orderModel";


// get user analytics ---only for the admins

export const getUserAnalytics=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const users= await generateLast12MonthData(userModel)
        res.status(201).json({
            succuss:true,
            users
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
  
})

// get courses analytics ---only for the admins

export const getCoursesAnalytics=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const courses= await generateLast12MonthData(CourseModel)
        res.status(201).json({
            succuss:true,
            courses
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
  
})

// get orders analytics ---only for the admins

export const getOrdersAnalytics=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const orders= await generateLast12MonthData(OrderModel)
        res.status(201).json({
            succuss:true,
            orders
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
    }
  
})


