import express from 'express';
import { translateText } from '../controllers/translationController.js';

const router = express.Router();

router.post('/translate', translateText);

export default router;

