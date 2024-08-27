import { Request, NextFunction, Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middlewere/catchAsyncError";


// Create a new course
export const createCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseModel.create(req.body);
        res.status(201).json({
            success: true,
            course,
        });
    } catch (error: any) {
        return next(error);  // If CatchAsyncError is handling this, you can also omit this block.
    }
});
