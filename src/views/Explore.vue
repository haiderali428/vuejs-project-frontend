<template>
  <div class="explore">
    <div class="page-header">
      <h1>Explore Videos</h1>
      <button v-if="isAuthenticated" @click="$emit('open-upload-modal')" class="upload-btn">
        Upload Video
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading videos...</p>
    </div>
    
    <div v-else-if="videos.length === 0" class="empty-state">
      <h3>No videos found</h3>
      <p>Be the first to upload a video!</p>
      <button v-if="isAuthenticated" @click="$emit('open-upload-modal')" class="upload-btn">
        Upload Your First Video
      </button>
    </div>
    
    <div v-else class="videos-grid">
      <div 
        v-for="video in videos" 
        :key="video.id" 
        class="video-card"
        @click="watchVideo(video.id)"
      >
        <div class="video-thumbnail">
          <div v-if="video.video_type === 'file'" class="local-video">
            <video :src="getVideoUrl(video.video_url)" preload="metadata"></video>
            <div class="play-overlay">
              <div class="play-icon">▶</div>
            </div>
          </div>
          <div v-else class="external-video-thumbnail">
            <div class="link-icon">🔗</div>
            <p>External Video</p>
          </div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ truncateDescription(video.description) }}</p>
          <div class="video-meta">
            <span class="uploader">By: {{ video.user_name }}</span>
            <span class="date">{{ formatDate(video.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { videosAPI } from '../api/videos';
import type { Video } from '../types';

interface Emits {
  (e: 'open-upload-modal'): void;
}

defineEmits<Emits>();

const router = useRouter();
const store = useStore();
const videos = ref<Video[]>([]);
const loading = ref(true);

const isAuthenticated = computed(() => store.getters.isAuthenticated);

const getVideoUrl = (videoUrl: string): string => {
  if (videoUrl.startsWith('http')) {
    return videoUrl;
  }
  return `http://localhost:5000${videoUrl}`;
};

const truncateDescription = (description: string): string => {
  if (!description) return 'No description';
  return description.length > 100 ? description.substring(0, 100) + '...' : description;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const watchVideo = (videoId: number): void => {
  router.push(`/watch/${videoId}`);
};

onMounted(async () => {
  try {
    const data = await videosAPI.getAllVideos();
    videos.value = data;
  } catch (error) {
    console.error('Error fetching videos:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.explore {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e1e1;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.upload-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background: #0056b3;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-state h3 {
  margin-bottom: 1rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 2rem;
  color: #999;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.video-thumbnail {
  width: 100%;
  height: 200px;
  background: #000;
  position: relative;
  overflow: hidden;
}

.local-video {
  position: relative;
  width: 100%;
  height: 100%;
}

.local-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #333;
}

.external-video-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.link-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.external-video-thumbnail p {
  margin: 0;
  font-weight: 500;
}

.video-info {
  padding: 1.5rem;
}

.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.uploader {
  font-weight: 500;
}

.date {
  color: #666;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .upload-btn {
    width: 100%;
  }
  
  .videos-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>