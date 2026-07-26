import { Router, Request, Response } from 'express';
import { InventoryService } from './service';

const router = Router();
const service = new InventoryService();

/**
 * @openapi
 * /api/inventory:
 *   get:
 *     summary: Get residential tower inventory
 *     description: Returns overall property portfolio statistics and nested tower unit availability.
 *     tags:
 *       - Inventory
 *     responses:
 *       200:
 *         description: Full inventory portfolio object with towers and units
 *       500:
 *         description: Internal server error
 */
router.get('/inventory', async (_req: Request, res: Response) => {
  try {
    const inventory = await service.getInventory();
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
