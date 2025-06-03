import { Router } from "express";



import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStatus,
  updateCampaign,
} from "../controllers/campaign.controller.js";

const router = Router();

// Route to create a new campaign
router.route("/create").post(createCampaign);
// Route to get all campaigns
router.route("/history").get(getCampaigns);
//Route to edit campaigns 
router.route("/:id").get(getCampaignById);
router.route("/:id").put(updateCampaign);

export default router;
