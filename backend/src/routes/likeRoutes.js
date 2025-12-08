import express from "express"
import {create_like, list_like, get_like_by_id, update_like, delete_like} from "../controllers/likeController.js"

const router=express.Router();

router.get("/",list_like);
router.get("/:id",get_like_by_id);
router.post("/",create_like);
router.put("/:id",update_like);
router.delete("/:id",delete_like);

export default router;