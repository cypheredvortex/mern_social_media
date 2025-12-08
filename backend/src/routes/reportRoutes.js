import express from "express"
import {create_report, list_report, get_report_by_id, update_report, delete_report} from "../controllers/reportController.js"

const router=express.Router();

router.get("/",list_report);
router.get("/:id",get_report_by_id);
router.post("/",create_report);
router.put("/:id",update_report);
router.delete("/:id",delete_report);

export default router;