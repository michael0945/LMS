import express from "express"
import { activateUser, LoginUser, LogoutUser, registrationUser } from "../controllers/user.controller"
import { isAuthenticated } from "../middlewere/auth";
const userRouter = express.Router()
userRouter.post('/registration',registrationUser);
userRouter.post('/activate-user',activateUser);
userRouter.post('/login-user',LoginUser);
userRouter.post('/logout-user',LogoutUser);
userRouter.get('/logout-user',isAuthenticated,LogoutUser);
export default userRouter;