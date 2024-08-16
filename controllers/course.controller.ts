import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from 'cloudinary'
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";



//upload courses
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "Courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        req.body = data;  // Make sure to update the req.body
        await createCourse(req, res, next);  // Pass req, res, and next to createCourse
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, { folder: "Courses" });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };
        }

        const courseId = req.params.ID;
        console.log("Course ID:", courseId);

        const course = await CourseModel.findByIdAndUpdate(courseId, {
            $set: data
        }, { new: true });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        console.log("Updated Course:", course);

        res.status(201).json({
            success: true,
            course
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//get single course  ---without purchasing


export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;

        // Check if the course data is available in Redis
        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            // Log the cached data for inspection
            console.log("Course data retrieved from Redis cache:", isCacheExist);

            const course = JSON.parse(isCacheExist);
            return res.status(200).json({
                success: true,
                course
            });
        } else {
            // Fetch the course from MongoDB if not available in Redis
            const course = await CourseModel.findById(courseId).select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            );

            // If no course is found in MongoDB, return a 404 error
            if (!course) {
                console.log("Course not found with ID:", courseId); // Log this case for clarity
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }

            // Optionally, you can store the fetched course data in Redis for future requests
            await redis.set(courseId, JSON.stringify(course));

            // Return the course data from MongoDB
            return res.status(200).json({
                success: true,
                course
            });
        }
    } catch (error: any) {
        // Log any unexpected errors
        console.error("Error fetching course:", error.message);

        // Handle errors by passing them to the next middleware
        return next(new ErrorHandler(error.message, 400));
    }
});


// get all courses --without purchasing
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses")
        if(isCacheExist){
            const courses= JSON.parse(isCacheExist)
            res.status(200).json({
                success:true,
                courses
            })
        }else{  const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")
            await redis.set("allCourses",JSON.stringify(courses))
            res.status(200).json({
                success: true,
                courses
            })
            
        }
      
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})


