<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>My Videos</h1>
      <button @click="$emit('open-upload-modal')" class="upload-btn">
        Upload Video
      </button>
    </div>

    <div v-if="videos.length === 0" class="empty-state">
      <h3>You haven't uploaded any videos yet.</h3>
      <p>Start sharing your content with the world!</p>
      <button @click="$emit('open-upload-modal')" class="upload-btn">
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
            <span class="date">Uploaded: {{ formatDate(video.created_at) }}</span>
            <button @click.stop="deleteVideo(video.id)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { videosAPI } from '../api/videos';
import type { Video } from '../types';

interface Emits {
  (e: 'open-upload-modal'): void;
}

defineEmits<Emits>();

const videos = ref<Video[]>([]);
const router = useRouter();

onMounted(async () => {
  await fetchMyVideos();
});

const fetchMyVideos = async (): Promise<void> => {
  try {
    const data = await videosAPI.getMyVideos();
    videos.value = data;
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
};

const getVideoUrl = (videoUrl: string): string => {
  if (videoUrl.startsWith('http')) {
    return videoUrl;
  }
  return `http://localhost:5000${videoUrl}`;
};

const watchVideo = (videoId: number): void => {
  router.push(`/watch/${videoId}`);
};

const deleteVideo = async (videoId: number): Promise<void> => {
  if (!confirm('Are you sure you want to delete this video?')) return;

  try {
    await videosAPI.deleteVideo(videoId);
    videos.value = videos.value.filter(v => v.id !== videoId);
  } catch (error) {
    console.error('Error deleting video:', error);
    alert('Failed to delete video');
  }
};

const truncateDescription = (description: string): string => {
  if (!description) return 'No description';
  return description.length > 100 ? description.substring(0, 100) + '...' : description;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.dashboard {
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

/* MATCHING EXPLORE PAGE GRID STYLE */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.video-info {
  padding: 1.5rem;
}

.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  line-height: 1.3;
}

.video-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #999;
}

.date {
  color: #666;
}

.delete-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #cc0000;
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

