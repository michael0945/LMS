import express from "express"
import { authorizeRole, isAuthenticated } from "../middlewere/auth"
import { getCoursesAnalytics, getOrdersAnalytics, getUserAnalytics } from "../controllers/analytics.controllers"
const analyticsRouter =express.Router()
analyticsRouter.get("/get-users-analytics",isAuthenticated,authorizeRole("admin"),getUserAnalytics);
analyticsRouter.get("/get-courses-analytics",isAuthenticated,authorizeRole("admin"),getCoursesAnalytics);
analyticsRouter.get("/get-orders-analytics",isAuthenticated,authorizeRole("admin"),getOrdersAnalytics);

export default analyticsRouter