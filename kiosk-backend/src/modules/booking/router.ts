import { Router, Request, Response } from 'express';
import { BookingService } from './service';
import { CustomError } from './repository';

const router = Router();
const service = new BookingService();

router.post('/book', async (req: Request, res: Response) => {
  try {
    const { unitId, customerName, phone, sessionId } = req.body;

    if (!unitId || typeof unitId !== 'number' || unitId <= 0) {
      return res.status(400).json({ error: 'Valid unitId is required' });
    }

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Customer name must be at least 2 characters long' });
    }

    if (!phone || typeof phone !== 'string' || phone.replace(/[^\d]/g, '').length < 7) {
      return res.status(400).json({ error: 'Phone number must contain at least 7 digits' });
    }

    const booking = await service.bookUnit({
      unitId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      sessionId: sessionId || 'default',
    });

    return res.status(201).json(booking);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ detail: error.message, error: error.message });
    }
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
