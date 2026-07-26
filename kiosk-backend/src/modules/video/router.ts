import { Router, Request, Response } from 'express';
import { VideoService } from './service';

const router = Router();
const service = new VideoService();

/**
 * @openapi
 * /api/videos:
 *   get:
 *     summary: Get promotional video showcase
 *     description: Returns catalog of high-definition video walkthrough items.
 *     tags:
 *       - Video Showcase
 *     responses:
 *       200:
 *         description: List of video walkthrough items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VideoItem'
 *       500:
 *         description: Internal server error
 */
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
