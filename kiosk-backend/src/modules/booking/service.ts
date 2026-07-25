import { BookingRepository, BookingRow } from './repository';
import { roomManager } from '../websocket/manager';

export interface BookingPayload {
  unitId: number;
  customerName: string;
  phone: string;
  sessionId?: string;
}

export class BookingService {
  private repository: BookingRepository;

  constructor() {
    this.repository = new BookingRepository();
  }

  async bookUnit(data: BookingPayload): Promise<BookingRow> {
    const booking = await this.repository.createBookingAtomic(
      data.unitId,
      data.customerName,
      data.phone
    );

    const sessionId = data.sessionId || 'default';
    await roomManager.broadcastUnitBooked(sessionId, data.unitId, data.customerName);

    return booking;
  }
}
