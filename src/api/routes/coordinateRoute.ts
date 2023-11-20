import express from 'express';

import { postCoordinates } from '../controllers/coordinateController';

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', postCoordinates);

export default router;
