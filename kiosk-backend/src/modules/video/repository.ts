import { pool } from '../../core/database';

export interface VideoItem {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
}

export class VideoRepository {
  async getAllVideos(): Promise<VideoItem[]> {
    const result = await pool.query<VideoItem>(
      'SELECT id, title, thumbnail, "videoUrl" FROM video ORDER BY id ASC'
    );
    return result.rows;
  }
}
