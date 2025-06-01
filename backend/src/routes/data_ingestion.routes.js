import { Router } from 'express';
import { ingestCustomers, ingestOrders } from '../controllers/data_ingestion.controller.js';


const router = Router();

router.route('/customers').post(ingestCustomers);
router.route('/orders').post(ingestOrders);

export default router;