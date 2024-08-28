import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel,{IOrder} from "../models/orderModel";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import path from "path"
import ejs from "ejs"
import sendMail from "../utils/sendingMail";
import NotificationModel from "../models/notificationModel";
import { newOrder } from "../services/order.service";
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;
        const user = await userModel.findById(req.user?._id);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Check if the user has already purchased the course
        const purchasedCourse = user.courses.find((course: any) => {
            return course.courseId === courseId; // Compare with courseId field in user's courses
        });

        if (purchasedCourse) {
            return next(new ErrorHandler("You have already purchased this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 400));
        }

        const data: any = {
            courseId: course._id,
            userId: user._id,
            payment_info
        };

        // Create the new order
        await newOrder(data, res, next);

        const mailData = {
            order: {
                _id: (course._id as string).toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-us", { year: 'numeric', month: 'long', day: 'numeric' })
            }
        };

        try {
            const html = await ejs.renderFile(path.join(__dirname, '../mails/order-conformation.ejs'), { order: mailData });
            console.log('Email template rendered:', !!html);

            await sendMail({
                email: user.email,
                subject: 'Order Confirmation',
                template: 'order-conformation.ejs',
                data: mailData
            });

            console.log('Email sent successfully to:', user.email);
        } catch (error: any) {
            console.error('Error while sending email:', error.message);
            return next(new ErrorHandler(error.message, 400));
        }

        user.courses.push({ courseId: course._id as string });
        await user.save();

        await NotificationModel.create({
            user: user._id,
            title: "New Order",
            message: `You have a new order for ${course.name}`
        });

        // Increment the purchased value correctly
        course.purchased = (course.purchased || 0) + 1;
        await course.save();

    } catch (error: any) {
        console.error('Error in createOrder:', error.message);
        return next(new ErrorHandler(error.message, 400));
    }
});