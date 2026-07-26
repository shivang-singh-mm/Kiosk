import { Router, Request, Response } from 'express';
import { GalleryService } from './service';

const router = Router();
const service = new GalleryService();

/**
 * @openapi
 * /api/gallery:
 *   get:
 *     summary: Get property gallery photos
 *     description: Returns list of high-definition architectural photo items.
 *     tags:
 *       - Gallery
 *     responses:
 *       200:
 *         description: List of gallery photo items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GalleryItem'
 *       500:
 *         description: Internal server error
 */
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
