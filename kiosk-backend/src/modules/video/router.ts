import { Router, Request, Response } from 'express';
import { VideoService } from './service';

const router = Router();
const service = new VideoService();

router.get('/videos', async (_req: Request, res: Response) => {
  try {
    const videos = await service.getAllVideos();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
