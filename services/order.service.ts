import { NextFunction, Response } from "express";
import OrderModel from "../models/orderModel";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";

// create a new order
export const newOrder = CatchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    try {
        const order = await OrderModel.create(data);
        res.status(201).json({
            success: true,
            order
        });
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});
