import api from './axios';
import { Video, VideoFormData } from '../types';

export const videosAPI = {
  async getAllVideos(): Promise<Video[]> {
    const response = await api.get('/videos');
    return response.data;
  },

  async getMyVideos(): Promise<Video[]> {
    const response = await api.get('/videos/my-videos');
    return response.data;
  },

  async getVideoById(videoId: number): Promise<Video> {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  async uploadVideo(
    formData: FormData, 
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<{ message: string; video: Video }> {
    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress,
      timeout: 300000 // 5 minutes for large files
    });
    return response.data;
  },

  async deleteVideo(videoId: number): Promise<{ message: string }> {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  },

  // Debug method for testing uploads
  async debugUpload(formData: FormData): Promise<any> {
    const response = await api.post('/debug-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};