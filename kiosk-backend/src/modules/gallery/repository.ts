import { pool } from '../../core/database';

export interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
}

export class GalleryRepository {
  async getAllImages(): Promise<GalleryItem[]> {
    const result = await pool.query<GalleryItem>(
      'SELECT id, title, "imageUrl" FROM gallery ORDER BY id ASC'
    );
    return result.rows;
  }
}
