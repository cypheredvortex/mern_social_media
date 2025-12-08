import express from "express"
import {create_follow, list_follow, get_follow_by_id, update_follow, delete_follow} from "../controllers/followController.js"

const router=express.Router();

router.get("/",list_follow);
router.get("/:id",get_follow_by_id);
router.post("/",create_follow);
router.put("/:id",update_follow);
router.delete("/:id",delete_follow);

export default router;