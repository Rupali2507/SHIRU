import mongoose, { mongo } from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected Succesfully")
    } catch (error) {
        console.error("Database connnection failed:",error.message)
        process.exit(1)
    }
}
export default connectDB;