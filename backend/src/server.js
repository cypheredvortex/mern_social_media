import express from "express"
import postRoutes from "./routes/postRoutes.js"
import { connectDB } from "./config/db.js"
import dotenv from "dotenv"

dotenv.config();

const app=express();
const PORT=process.env.PORT;

app.use(express.json());

app.use((req,res,next)=>{
    console.log(`${req.method} ${req.url}`);
    next();
})

app.use("/api/posts",postRoutes);

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on port: ${PORT}`);
    });
});
