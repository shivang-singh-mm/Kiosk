export type UnitStatus = 'AVAILABLE' | 'BOOKED';

export interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
}

export interface VideoItem {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
}

export interface Unit {
  id: number;
  towerId: number;
  number: string;
  status: UnitStatus;
}

export interface Tower {
  id: number;
  name: string;
  units: Unit[];
}

export interface InventoryData {
  towers: Tower[];
  totalUnits: number;
  availableUnits: number;
  bookedUnits: number;
}

export interface BookingPayload {
  unitId: number;
  customerName: string;
  phone: string;
  sessionId?: string;
}

export interface BookingResponse {
  id: number;
  unitId: number;
  customerName: string;
  phone: string;
  bookedAt: string;
}

export type ActivePage = 'inventory' | 'gallery' | 'videos';

export interface VideoPlaybackState {
  videoId: number;
  title: string;
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
