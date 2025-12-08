import express from "express"
import {create_comment, list_comment, get_comment_by_id, update_comment, delete_comment} from "../controllers/commentController.js"

const router=express.Router();

router.get("/",list_comment);
router.get("/:id",get_comment_by_id);
router.post("/",create_comment);
router.put("/:id",update_comment);
router.delete("/:id",delete_comment);

export default router;