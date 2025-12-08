import express from "express"
import {create_profile, list_profile, get_profile_by_id, update_profile, delete_profile} from "../controllers/profileController.js"

const router=express.Router();

router.get("/",list_profile);
router.get("/:id",get_profile_by_id);
router.post("/",create_profile);
router.put("/:id",update_profile);
router.delete("/:id",delete_profile);

export default router;