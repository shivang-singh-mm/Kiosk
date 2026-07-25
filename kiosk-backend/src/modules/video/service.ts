import { VideoRepository, VideoItem } from './repository';

export class VideoService {
  private repository: VideoRepository;

  constructor() {
    this.repository = new VideoRepository();
  }

  async getAllVideos(): Promise<VideoItem[]> {
    return await this.repository.getAllVideos();
  }
}
