import { Router, Request, Response } from 'express';
import { InventoryService } from './service';

const router = Router();
const service = new InventoryService();

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
