import axios from 'axios';
import { GalleryItem, VideoItem, InventoryData, BookingPayload, BookingResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getGallery = async (): Promise<GalleryItem[]> => {
  const response = await api.get<GalleryItem[]>('/gallery');
  return response.data;
};

export const getVideos = async (): Promise<VideoItem[]> => {
  const response = await api.get<VideoItem[]>('/videos');
  return response.data;
};

export const getInventory = async (): Promise<InventoryData> => {
  const response = await api.get<InventoryData>('/inventory');
  return response.data;
};

export const bookUnit = async (payload: BookingPayload): Promise<BookingResponse> => {
  const response = await api.post<BookingResponse>('/book', payload);
  return response.data;
};

export default api;
