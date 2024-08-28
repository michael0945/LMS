import express from "express";
import { authorizeRole, isAuthenticated } from "../middlewere/auth";
import { getNotification, updateNotification } from "../controllers/notification-controller";

const notificationRouter = express.Router();

notificationRouter.get("/get-all-notifications", isAuthenticated, authorizeRole("admin"), getNotification);
notificationRouter.put("/update-notification/:id", isAuthenticated,authorizeRole("admin"),updateNotification)
export default notificationRouter;
