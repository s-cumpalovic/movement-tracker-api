import express from 'express';

import { saveFileToPersistentStorage } from '../controllers/videoController';

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', saveFileToPersistentStorage);

export default router;
