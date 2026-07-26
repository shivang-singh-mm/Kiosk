import { getDB, PendingBookingRecord } from './db';

export class BookingQueueService {
  async addPendingBooking(
    data: Omit<PendingBookingRecord, 'id' | 'createdAt' | 'status'>
  ): Promise<number> {
    const db = await getDB();
    const record: PendingBookingRecord = {
      ...data,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    const key = await db.add('pendingBookings', record);
    return key as number;
  }

  async getPendingBookings(): Promise<PendingBookingRecord[]> {
    const db = await getDB();
    const bookings = await db.getAll('pendingBookings');
    // Sort FIFO by id or createdAt
    return bookings.sort((a, b) => (a.id || 0) - (b.id || 0));
  }

  async removePendingBooking(id: number): Promise<void> {
    const db = await getDB();
    await db.delete('pendingBookings', id);
  }

  async updateBookingStatus(id: number, status: 'PENDING' | 'SYNCING'): Promise<void> {
    const db = await getDB();
    const booking = await db.get('pendingBookings', id);
    if (booking) {
      booking.status = status;
      await db.put('pendingBookings', booking);
    }
  }

  async clearAllPendingBookings(): Promise<void> {
    const db = await getDB();
    await db.clear('pendingBookings');
  }
}

export const bookingQueueService = new BookingQueueService();
