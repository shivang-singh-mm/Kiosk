import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface GalleryCacheRecord {
  id: number;
  url: string;
  blob: Blob;
  downloadedAt: string;
}

export interface VideoCacheRecord {
  id: number;
  url: string;
  blob: Blob;
  downloadedAt: string;
}

export interface PendingBookingRecord {
  id?: number;
  unitId: number;
  unitNumber: string;
  towerName?: string;
  customerName: string;
  phone: string;
  createdAt: string;
  status: 'PENDING' | 'SYNCING';
}

export interface KioskDBSchema extends DBSchema {
  galleryCache: {
    key: number;
    value: GalleryCacheRecord;
  };
  videoCache: {
    key: number;
    value: VideoCacheRecord;
  };
  pendingBookings: {
    key: number;
    value: PendingBookingRecord;
  };
}

const DB_NAME = 'kiosk_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KioskDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<KioskDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<KioskDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('galleryCache')) {
          db.createObjectStore('galleryCache', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('videoCache')) {
          db.createObjectStore('videoCache', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pendingBookings')) {
          db.createObjectStore('pendingBookings', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}
