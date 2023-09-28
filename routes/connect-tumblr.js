import express from 'express';
const router = express.Router();

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/', async (req, res) => {
  res.sendFile(__dirname + '/views/connect-tumblr.html')
});

export default router;