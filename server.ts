import app from "./app";
import connectDB from "./utils/db";
import {v2 as cloudinary} from "cloudinary"
require("dotenv").config();
//clodinary
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.CLOUD_API_KEY,
  api_secret:process.env.CLOUD_SECRET_KEY

})


const port = process.env.PORT || 3000;
//create a server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});