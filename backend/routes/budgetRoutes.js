import express from 'express';
import { getBudget, setBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getBudget);
router.post('/', setBudget);
router.put('/', setBudget);

export default router;
