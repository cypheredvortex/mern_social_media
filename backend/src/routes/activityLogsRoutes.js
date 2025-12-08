import express from "express"
import {create_activityLog, list_activityLog, get_activityLog_by_id, update_activityLog, delete_activityLog} from "../controllers/activityLogController.js"

const router=express.Router();

router.get("/",list_activityLog);
router.get("/:id",get_activityLog_by_id);
router.post("/",create_activityLog);
router.put("/:id",update_activityLog);
router.delete("/:id",delete_activityLog);

export default router;