import { NextFunction, Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middlewere/catchAsyncError";

//create course
export const createCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const course = await CourseModel.create(req.body);
    res.status(201).json({
        success: true,
        course
    });
});
