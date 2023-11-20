import express from 'express';

import { uploadVideo } from '../controllers/videoController';

const router = express.Router();

router.post('/', uploadVideo);

export default router;
