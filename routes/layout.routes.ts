import express from "express"
import { authorizeRole, isAuthenticated } from "../middlewere/auth"
import { createLayout } from "../controllers/layout.controllers"
const layoutRouter =express.Router()


layoutRouter.post("/create-layout",isAuthenticated,authorizeRole("admin"),createLayout)

export default layoutRouter