import { Router, Request, Response } from 'express';
import { GalleryService } from './service';

const router = Router();
const service = new GalleryService();

router.get('/gallery', async (_req: Request, res: Response) => {
  try {
    const images = await service.getAllImages();
    res.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
