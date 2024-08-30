import express from "express"
import { authorizeRole, isAuthenticated } from "../middlewere/auth"
import { createLayout, editLayout, getLayOutByType } from "../controllers/layout.controllers"
const layoutRouter =express.Router()


layoutRouter.post("/create-layout",isAuthenticated,authorizeRole("admin"),createLayout)
layoutRouter.put("/edit-layout",isAuthenticated,authorizeRole("admin"),editLayout)
layoutRouter.get("/get-layout",getLayOutByType)

export default layoutRouter