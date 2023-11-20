import express from 'express';

import { getRecordById } from '../controllers/videoController';

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/records/:id', getRecordById);

export default router;
