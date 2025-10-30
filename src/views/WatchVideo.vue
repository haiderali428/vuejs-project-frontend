<template>
  <div class="watch-page">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading video...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="back-button">Back to Explore</router-link>
    </div>
    
    <div v-else-if="video" class="video-container">
      <div class="video-player-section">
        <div class="video-wrapper">
          <video 
            v-if="video.video_type === 'file'" 
            :src="getVideoUrl(video.video_url)" 
            controls 
            autoplay
            class="video-player"
            @loadedmetadata="onVideoLoaded"
            @error="onVideoError"
          >
            Your browser does not support the video tag.
          </video>
          
          <div v-else class="external-video">
            <div class="external-link">
              <h3>External Video</h3>
              <p>This video is hosted externally. Click the link below to watch:</p>
              <a :href="video.video_url" target="_blank" class="external-link-button">
                Watch on External Site
              </a>
            </div>
          </div>
        </div>
        
        <div class="video-info">
          <h1 class="video-title">{{ video.title }}</h1>
          <p class="video-description">{{ video.description }}</p>
          
          <div class="video-meta">
            <div class="uploader-info">
              <strong>Uploaded by:</strong> {{ video.user_name }}
            </div>
            <div class="upload-date">
              <strong>Uploaded on:</strong> {{ formatDate(video.created_at) }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="actions-section">
        <router-link to="/" class="back-button">
          ← Back to Explore
        </router-link>
        
        <button 
          v-if="isVideoOwner" 
          @click="deleteVideo" 
          class="delete-button"
        >
          Delete Video
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { videosAPI } from '../api/videos';
import type { Video } from '../types';

const route = useRoute();
const router = useRouter();
const store = useStore();

const video = ref<Video | null>(null);
const loading = ref(true);
const error = ref('');

const isVideoOwner = computed(() => {
  return store.getters.isAuthenticated && video.value?.user_id === store.getters.currentUser?.id;
});

const getVideoUrl = (videoUrl: string): string => {
  if (videoUrl.startsWith('http')) {
    return videoUrl;
  }
  return `http://localhost:5000${videoUrl}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const onVideoLoaded = () => {
  console.log('Video metadata loaded');
};

const onVideoError = (e: Event) => {
  console.error('Video loading error:', e);
  error.value = 'Failed to load video. The file might be corrupted or missing.';
};

const deleteVideo = async (): Promise<void> => {
  if (!video.value || !confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
    return;
  }

  try {
    await videosAPI.deleteVideo(video.value.id);
    router.push('/dashboard');
  } catch (err: any) {
    console.error('Error deleting video:', err);
    error.value = 'Failed to delete video. Please try again.';
  }
};

onMounted(async () => {
  const videoId = parseInt(route.params.id as string);
  
  if (isNaN(videoId)) {
    error.value = 'Invalid video ID';
    loading.value = false;
    return;
  }

  try {
    video.value = await videosAPI.getVideoById(videoId);
  } catch (err: any) {
    console.error('Error fetching video:', err);
    error.value = err.response?.data?.error || 'Video not found';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.watch-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 4rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}

.error h2 {
  margin-bottom: 1rem;
}

.back-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background: #0056b3;
}

.video-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.video-player-section {
  padding: 0;
}

.video-wrapper {
  background: #000;
}

.video-player {
  width: 100%;
  height: auto;
  max-height: 70vh;
  display: block;
}

.external-video {
  padding: 4rem 2rem;
  text-align: center;
  background: #f8f9fa;
}

.external-link h3 {
  margin-bottom: 1rem;
  color: #333;
}

.external-link p {
  margin-bottom: 2rem;
  color: #666;
}

.external-link-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.external-link-button:hover {
  background: #0056b3;
}

.video-info {
  padding: 2rem;
}

.video-title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.3;
}

.video-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 2rem;
  white-space: pre-wrap;
}

.video-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.uploader-info,
.upload-date {
  font-size: 0.95rem;
}

.uploader-info strong,
.upload-date strong {
  color: #333;
}

.actions-section {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e1e1e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-button {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .watch-page {
    padding: 1rem;
  }
  
  .video-title {
    font-size: 1.4rem;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .back-button,
  .delete-button {
    text-align: center;
  }
}
</style>