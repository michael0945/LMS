import { NextFunction, Request, Response } from "express";
import NotificationModel from "../models/notificationModel";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron"

// get all notifications ---only for admin
export const getNotification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await NotificationModel.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        notifications,
    });
});
// update notification status --- only for admins
export const updateNotification = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id)
        if (!notification) {
            return next(new ErrorHandler("Notification not found", 400))
        } else {
            notification.status ? notification.status = "read" : notification?.status
        }
        await notification.save()
        const notifications = await NotificationModel.find().sort({ createdAt: -1 })
        res.status(201).json({
            succuss: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})
// delete notification --only for admins

cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await NotificationModel.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } })
    console.log('Delete read notifications')
});
