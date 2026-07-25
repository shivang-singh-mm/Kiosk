import { GalleryRepository, GalleryItem } from './repository';

export class GalleryService {
  private repository: GalleryRepository;

  constructor() {
    this.repository = new GalleryRepository();
  }

  async getAllImages(): Promise<GalleryItem[]> {
    return await this.repository.getAllImages();
  }
}
