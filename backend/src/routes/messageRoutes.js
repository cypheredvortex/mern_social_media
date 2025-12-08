import express from "express"
import {create_message, list_message, get_message_by_id, update_message, delete_message} from "../controllers/messageController.js"

const router=express.Router();

router.get("/",list_message);
router.get("/:id",get_message_by_id);
router.post("/",create_message);
router.put("/:id",update_message);
router.delete("/:id",delete_message);

export default router;