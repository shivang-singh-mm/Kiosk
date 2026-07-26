import { Router, Request, Response } from 'express';
import { BookingService } from './service';
import { CustomError } from './repository';
import { validateRequest } from '../../core/middleware/validate';
import { bookUnitSchema } from './schema';

const router = Router();
const service = new BookingService();

/**
 * @openapi
 * /api/book:
 *   post:
 *     summary: Reserve a unit
 *     description: Atomically reserves an available unit for a customer. Prevents concurrent double-booking.
 *     tags:
 *       - Booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingRequest'
 *     responses:
 *       201:
 *         description: Unit successfully reserved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookingResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Unit already booked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/book', validateRequest(bookUnitSchema), async (req: Request, res: Response) => {
  try {
    const { unitId, customerName, phone, sessionId } = req.body;

    const booking = await service.bookUnit({
      unitId,
      customerName,
      phone,
      sessionId,
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
