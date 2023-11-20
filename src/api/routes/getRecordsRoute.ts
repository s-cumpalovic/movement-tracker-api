import express from 'express';

import { getRecords } from '../controllers/videoController';

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/', getRecords);

export default router;
