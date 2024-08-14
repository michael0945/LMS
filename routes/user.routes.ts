import express from "express"
import { activateUser, getUserInfo, LoginUser, LogoutUser, registrationUser, socialAuth, updateAccessToken } from "../controllers/user.controller"
import { isAuthenticated } from "../middlewere/auth";
const userRouter = express.Router()
userRouter.post('/registration',registrationUser);
userRouter.post('/activate-user',activateUser);
userRouter.post('/login-user',LoginUser);
userRouter.post('/logout-user',LogoutUser);
userRouter.get('/logout-user',isAuthenticated,LogoutUser);
userRouter.get('/refresh',updateAccessToken);
userRouter.get('/me',isAuthenticated,getUserInfo);
userRouter.post('/social-auth',socialAuth);
export default userRouter;