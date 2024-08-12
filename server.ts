import app from "./app";
import connectDB from "./utils/db";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});