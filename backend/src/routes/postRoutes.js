import express from "express"
import { create_post, list_post, update_post, delete_post, get_post_by_id } from "../controllers/postController.js"

const router=express.Router();

router.get("/",list_post);
router.get("/:id",get_post_by_id);
router.post("/",create_post);
router.put("/:id",update_post);
router.delete("/:id",delete_post);

export default router;