import express from "express"
import {create_share, list_share, get_share_by_id, update_share, delete_share} from "../controllers/shareController.js"

const router=express.Router();

router.get("/",list_share);
router.get("/:id",get_share_by_id);
router.post("/",create_share);
router.put("/:id",update_share);
router.delete("/:id",delete_share);

export default router;