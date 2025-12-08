import express from "express"
import {create_user, list_user, get_user_by_id, update_user, delete_user} from "../controllers/userController.js"

const router=express.Router();

router.get("/",list_user);
router.get("/:id",get_user_by_id);
router.post("/",create_user);
router.put("/:id",update_user);
router.delete("/:id",delete_user);

export default router;