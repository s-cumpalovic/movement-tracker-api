import express from 'express';

import { deleteRecord } from '../controllers/videoController';

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.delete('/records/:id', deleteRecord);

export default router;
