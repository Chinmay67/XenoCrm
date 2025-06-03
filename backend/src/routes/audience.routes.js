import { Router } from "express";

const router = Router();
import {
    getCustomerCount,
} from "../controllers/audience.controller.js";


router.route("/").post(getCustomerCount);
export default router;