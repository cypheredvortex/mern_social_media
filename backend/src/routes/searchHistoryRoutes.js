import express from "express"
import {create_searchHistory, list_searchHistory, get_searchHistory_by_id, update_searchHistory, delete_searchHistory} from "../controllers/searchHistoryController.js"

const router=express.Router();

router.get("/",list_searchHistory);
router.get("/:id",get_searchHistory_by_id);
router.post("/",create_searchHistory);
router.put("/:id",update_searchHistory);
router.delete("/:id",delete_searchHistory);

export default router;