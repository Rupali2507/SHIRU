import express from 'express';
import connectDB from './config/connectDB.js';
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import merchantRoutes from "./routes/merchantRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.get('/',(req,res)=>{
    res.json({
        success: true,
        message: "Shiru backend is running"
    })
})

app.use("/api/auth", authRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",orderRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`Server is runnning at ${process.env.PORT}`)
})