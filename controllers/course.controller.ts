import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middlewere/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from 'cloudinary'
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path"
import ejs, { name } from "ejs";
import sendMail from "../utils/sendingMail";



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
// export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Clear any existing Redis cache
//         await redis.del("allCourses");

//         // Fetch all courses that are not deleted, excluding sensitive fields
//         const courses = await CourseModel.find({ isDeleted: { $ne: true } })
//             .select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

//         console.log("Fetched courses from DB:", courses); // Log the fetched data

//         // Cache the full course data
//         await redis.set("allCourses", JSON.stringify(courses), 'EX', 3600);

//         res.status(200).json({
//             success: true,
//             courses
//         });

//     } catch (error: any) {
//         return next(new ErrorHandler(error.message, 400));
//     }
// });
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses");
        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                courses
            });
        } else {
            // Assuming isDeleted is a boolean field in your schema that marks a course as deleted
            const courses = await CourseModel.find()
                .select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            await redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// get course content only for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;  // User's course list
        const courseId = req.params.id;  // Get the course ID from request params

        // Check if the course exists for the user
        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId);
        if (!courseExist) {
            return next(new ErrorHandler('You are not eligible to access this course', 400));
        }

        // Fetch the course from the database
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler('Course not found', 404));
        }

        // Fetch the course content (courseData)
        const content = course?.courseData;

        // Return the entire course along with the content
        res.status(200).json({
            success: true,
            // course,  // Include full course details
            content  // Course content (courseData)
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// add questions
interface IAddQuestionData {
    question: string,
    courseId: string,
    contentId: string


}
export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, contentId, courseId }: IAddQuestionData = req.body
        const course = await CourseModel.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("invalid content", 400))
        }
        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId))

        if (!contentId) {
            return next(new ErrorHandler("Invalid content id", 400))
        }
        // create a new question object
        const newQuestions: any = {
            user: req.user,
            question,
            questionReplies: []
        }
        //add this question to our course content
        courseContent?.questions.push(newQuestions)
        // save the updated course
        await course?.save()
        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))


    }
})
// add answering course question
interface IAddAnswerData{
    answer:string,
    courseId:string,
    contentId:string
    questionId:string
}
export const addAnswer=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {answer,courseId,contentId,questionId}:IAddAnswerData=req.body
        const course = await CourseModel.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("invalid content", 400))
        }
        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId))

        if (!contentId) {
            return next(new ErrorHandler("Invalid content id", 400))
        }
        const question= courseContent?.questions.find((item:any)=>item._id.equals(questionId))
   if(!question){
    return next(new ErrorHandler("Invalid questions",400))
   }
   // create  a new answer object
   const newAnswer:any={
    user:req.user,
    answer
   }
   // add this answer to course content
   question.questionReplies.push(newAnswer);
      await course?.save()
      if(req.user?._id === question.user._id ){
        // create a notification
        
      }else{
        const data={
            name:question.user.name,
            title:courseContent?.title

        }
        const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);
    try {
        await sendMail({
            email:question.user.email,
            subject:"Question Reply",
            template:"question-reply.ejs",
            data
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
        
    } 
    }
res.status(200).json({
    success:true,
    course
})
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
        
    }
}) 
//add review in the course
interface IAddReviewData {
    review: string;
    rating: number;
    userId: string;
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        // Log the course list, course ID, and their types to debug
        console.log("User's course list:", userCourseList);
        console.log("Course ID from params:", courseId);
        console.log("Course ID type:", typeof courseId);

        // Ensure that both course._id and courseId are strings for comparison
        const courseExist = userCourseList?.some((course: any) => {
            console.log("Course _id in list:", course._id.toString());
            console.log("Course _id type:", typeof course._id);
            return course._id.toString() === courseId.toString();
        });
        
        console.log("Course exists in user's course list:", courseExist);

        if (!courseExist) {
            return next(new ErrorHandler("You are not eligible to access this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        const { review, rating } = req.body as IAddReviewData;
        const reviewData: any = {
            user: req.user,
            comment: review,
            rating
        };

        course.reviews.push(reviewData);

        // Calculate the average rating
        let avg = 0;
        course.reviews.forEach((rev: any) => {
            avg += rev.rating;
        });

        if (course.reviews.length > 0) {
            course.ratings = avg / course.reviews.length;
        }

        await course.save();

        const notification = {
            title: "New review received",
            message: `${req.user?.name} has given a review on ${course.name}`,
        };

        // Create a notification (implement this function based on your application's notification logic)

        res.status(200).json({
            success: true,
            course
        });
        
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
// add reply in review
interface IAddReviewData{
    comment:string
    courseId:string
    reviewId:string

}
export const addReplyToReview= CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {comment,courseId,reviewId}= req.body as IAddReviewData
        const course = await CourseModel.findById(courseId)
        if(!course){
            return next(new ErrorHandler("course is not found",400))
        }
        const review =course?.reviews?.find((rev:any)=>rev._id.toString() === reviewId)
        if(!review){
          return next(new ErrorHandler("Review not found",400))
        }
        const replyData:any ={
            user:req.user,
            comment
        }
        if(!review.commentReplies){
            review.commentReplies=[]
        }
        review.commentReplies?.push(replyData)
        await course?.save();
        res.status(200).json({
            success:true,
            course
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400))
        
    }
})
