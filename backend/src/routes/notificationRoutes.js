import express from "express"
import {create_notification, list_notification, get_notification_by_id, update_notification, delete_notification} from "../controllers/notificationController.js"

const router=express.Router();

router.get("/",list_notification);
router.get("/:id",get_notification_by_id);
router.post("/",create_notification);
router.put("/:id",update_notification);
router.delete("/:id",delete_notification);

export default router;