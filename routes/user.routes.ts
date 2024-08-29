import express from "express"
import { activateUser, deleteUser, getAllUsers, getUserInfo, LoginUser, LogoutUser, registrationUser, socialAuth, updateAccessToken, updatePassword, updateUserInfo, updateUserRole, uploadProfilePicture } from "../controllers/user.controller"
import { authorizeRole, isAuthenticated } from "../middlewere/auth";

const userRouter = express.Router()
userRouter.post('/registration',registrationUser);
userRouter.post('/activate-user',activateUser);
userRouter.post('/login-user',LoginUser);
userRouter.post('/logout-user',LogoutUser);
userRouter.get('/logout-user',isAuthenticated,LogoutUser);
userRouter.get('/refresh',updateAccessToken);
userRouter.get('/me',isAuthenticated,getUserInfo);
userRouter.post('/social-auth',socialAuth);
userRouter.put('/update-user-info',isAuthenticated,updateUserInfo);
userRouter.put('/update-user-password',isAuthenticated,updatePassword);
userRouter.put('/update-user-avatar',isAuthenticated,uploadProfilePicture);
userRouter.get('/get-users',isAuthenticated,authorizeRole("admin"),getAllUsers);
userRouter.put('/update-user',isAuthenticated,authorizeRole("admin"),updateUserRole);
userRouter.delete('/delete-user/:id',isAuthenticated,authorizeRole("admin"),deleteUser);



export default userRouter;