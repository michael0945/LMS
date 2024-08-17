import express from "express"
import { addAnswer, addQuestion, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller"
import { authorizeRole, isAuthenticated } from "../middlewere/auth"
const courseRouter=express.Router()
courseRouter.post("/create-course",isAuthenticated,authorizeRole("admin"),uploadCourse)
courseRouter.put("/edit-course/:ID",isAuthenticated,authorizeRole("admin"),editCourse)
courseRouter.put("/edit-course/:ID",isAuthenticated,authorizeRole("admin"),editCourse)
courseRouter.get("/get-course/:id",isAuthenticated,authorizeRole("admin"),getSingleCourse)
courseRouter.get("/get-courses/:id",isAuthenticated,getAllCourses)
courseRouter.get("/get-course-content/:id",isAuthenticated,getCourseByUser)
courseRouter.put("/add-questions",isAuthenticated,addQuestion)
courseRouter.put('/add-answer',isAuthenticated,addAnswer);
export default courseRouter;