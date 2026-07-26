import { getDB, GalleryCacheRecord, VideoCacheRecord } from './db';

export class MediaService {
  async saveGalleryMedia(id: number, url: string, blob: Blob): Promise<void> {
    const db = await getDB();
    const record: GalleryCacheRecord = {
      id,
      url,
      blob,
      downloadedAt: new Date().toISOString(),
    };
    await db.put('galleryCache', record);
  }

  async getGalleryMedia(id: number): Promise<GalleryCacheRecord | undefined> {
    const db = await getDB();
    return await db.get('galleryCache', id);
  }

  async getAllGalleryMediaIds(): Promise<number[]> {
    const db = await getDB();
    const keys = await db.getAllKeys('galleryCache');
    return keys as number[];
  }

  async saveVideoMedia(id: number, url: string, blob: Blob): Promise<void> {
    const db = await getDB();
    const record: VideoCacheRecord = {
      id,
      url,
      blob,
      downloadedAt: new Date().toISOString(),
    };
    await db.put('videoCache', record);
  }

  async getVideoMedia(id: number): Promise<VideoCacheRecord | undefined> {
    const db = await getDB();
    return await db.get('videoCache', id);
  }

  async getAllVideoMediaIds(): Promise<number[]> {
    const db = await getDB();
    const keys = await db.getAllKeys('videoCache');
    return keys as number[];
  }

  async clearExpiredMedia(olderThanDays: number = 30): Promise<void> {
    const db = await getDB();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const galleryTx = db.transaction('galleryCache', 'readwrite');
    const galleryStore = galleryTx.objectStore('galleryCache');
    const galleryItems = await galleryStore.getAll();
    for (const item of galleryItems) {
      if (new Date(item.downloadedAt) < cutoff) {
        await galleryStore.delete(item.id);
      }
    }

    const videoTx = db.transaction('videoCache', 'readwrite');
    const videoStore = videoTx.objectStore('videoCache');
    const videoItems = await videoStore.getAll();
    for (const item of videoItems) {
      if (new Date(item.downloadedAt) < cutoff) {
        await videoStore.delete(item.id);
      }
    }
  }
}

export const mediaService = new MediaService();
