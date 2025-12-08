import express from "express"
import {create_media, get_media_by_id, list_media, update_media, delete_media} from "../controllers/mediaController.js"

const router=express.Router();

router.get("/",list_media);
router.get("/:id",get_media_by_id);
router.post("/",create_media);
router.put("/:id",update_media);
router.delete("/:id",delete_media);

export default router;