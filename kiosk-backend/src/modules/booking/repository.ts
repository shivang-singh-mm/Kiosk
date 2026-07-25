import { pool } from '../../core/database';

export interface BookingRow {
  id: number;
  unitId: number;
  customerName: string;
  phone: string;
  bookedAt: Date;
}

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class BookingRepository {
  async createBookingAtomic(
    unitId: number,
    customerName: string,
    phone: string
  ): Promise<BookingRow> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Step 1: Check unit existence
      const unitRes = await client.query<{ id: number; status: string }>(
        'SELECT id, status FROM unit WHERE id = $1',
        [unitId]
      );

      if (unitRes.rows.length === 0) {
        throw new CustomError(`Unit with ID ${unitId} not found.`, 404);
      }

      if (unitRes.rows[0].status === 'BOOKED') {
        throw new CustomError('This unit has already been booked.', 409);
      }

      // Step 2: Atomic conditional status transition
      const updateRes = await client.query(
        "UPDATE unit SET status = 'BOOKED' WHERE id = $1 AND status = 'AVAILABLE'",
        [unitId]
      );

      if (updateRes.rowCount === 0) {
        throw new CustomError('This unit has already been booked.', 409);
      }

      // Step 3: Record booking log
      const insertRes = await client.query<BookingRow>(
        'INSERT INTO booking ("unitId", "customerName", phone, "bookedAt") VALUES ($1, $2, $3, NOW()) RETURNING id, "unitId", "customerName", phone, "bookedAt"',
        [unitId, customerName, phone]
      );

      await client.query('COMMIT');
      return insertRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
