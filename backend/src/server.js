import express from "express"
import postRoutes from "./routes/postRoutes.js"
import activityLogsRoutes from "./routes/activityLogsRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import followRoutes from "./routes/followRoutes.js"
import likeRoutes from "./routes/likeRoutes.js"
import mediaRoutes from "./routes/mediaRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
import searchHistoryRoutes from "./routes/searchHistoryRoutes.js"
import shareRoutes from "./routes/shareRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import userSettingsRoutes from "./routes/userSettingsRoutes.js"
import { connectDB } from "./config/db.js"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config();

const app=express();
const PORT=process.env.PORT;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
}));
app.use((req,res,next)=>{
    console.log(`${req.method} ${req.url}`);
    next();
})

app.use("/api/posts",postRoutes);
app.use("/api/activity-logs",activityLogsRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/follows",followRoutes);
app.use("/api/likes",likeRoutes);
app.use("/api/media",mediaRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/profiles",profileRoutes);
app.use("/api/reports",reportRoutes);
app.use("/api/search-histories",searchHistoryRoutes);
app.use("/api/shares",shareRoutes);
app.use("/api/users",userRoutes);
app.use("/api/user-settings",userSettingsRoutes);

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on port: ${PORT}`);
    });
});
