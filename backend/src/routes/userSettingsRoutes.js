import express from "express"
import {create_userSettings, list_userSettings, get_userSettings_by_id, update_userSettings, delete_userSettings} from "../controllers/userSettingsController.js"

const router=express.Router();

router.get("/",list_userSettings);
router.get("/:id",get_userSettings_by_id);
router.post("/",create_userSettings);
router.put("/:id",update_userSettings);
router.delete("/:id",delete_userSettings);

export default router;