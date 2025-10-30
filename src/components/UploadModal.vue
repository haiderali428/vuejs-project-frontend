<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Upload Video</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="uploadVideo" class="upload-form">
        <div class="form-group">
          <label>Title *</label>
          <input v-model="form.title" type="text" required placeholder="Enter video title">
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="3" placeholder="Enter video description"></textarea>
        </div>
        
        <div class="upload-options">
          <div class="option-tabs">
            <button 
              type="button" 
              :class="{ active: uploadType === 'file' }"
              @click="uploadType = 'file'; form.video_url = ''"
            >
              Upload File
            </button>
            <button 
              type="button" 
              :class="{ active: uploadType === 'link' }"
              @click="uploadType = 'link'; selectedFile = null"
            >
              Video Link
            </button>
          </div>
          
          <div v-if="uploadType === 'file'" class="file-upload">
            <div class="file-input-wrapper">
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileUpload"
                accept="video/*"
                required
              >
              <div class="file-drop-area" @click="fileInput?.click()">
                <p>Click to select video file or drag and drop</p>
                <p class="file-hint">Max file size: 500MB</p>
              </div>
            </div>
            <div v-if="selectedFile" class="file-info">
              <p><strong>Selected File:</strong> {{ selectedFile.name }}</p>
              <p><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
              <p><strong>Type:</strong> {{ selectedFile.type }}</p>
            </div>
          </div>
          
          <div v-else class="link-upload">
            <input 
              v-model="form.video_url" 
              type="url" 
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              required
            >
          </div>
        </div>
        
        <div class="upload-progress" v-if="uploadProgress > 0">
          <div class="progress-info">
            <span>Uploading: {{ uploadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" :disabled="uploading">Cancel</button>
          <button type="submit" :disabled="uploading || !isFormValid" class="upload-button">
            <span v-if="uploading">Uploading...</span>
            <span v-else>Upload Video</span>
          </button>
        </div>
      </form>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="debugInfo" class="debug-info">
        <h4>Debug Info:</h4>
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { videosAPI } from '../api/videos';
import type { VideoFormData } from '../types';

interface Emits {
  (e: 'close'): void;
  (e: 'video-uploaded'): void;
}

const emit = defineEmits<Emits>();

const uploadType = ref<'file' | 'link'>('file');
const form = reactive<VideoFormData>({
  title: '',
  description: '',
  video_url: '',
  video_type: 'file'
});
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);
const uploadProgress = ref(0);
const errorMessage = ref('');
const debugInfo = ref('');

const isFormValid = computed(() => {
  if (!form.title.trim()) return false;
  
  if (uploadType.value === 'file') {
    return !!selectedFile.value;
  } else {
    return !!form.video_url.trim();
  }
});

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      errorMessage.value = 'Please select a valid video file (MP4, AVI, MOV, etc.)';
      target.value = '';
      return;
    }
    
    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      errorMessage.value = `File size must be less than 500MB. Selected file is ${formatFileSize(file.size)}`;
      target.value = '';
      return;
    }
    
    selectedFile.value = file;
    errorMessage.value = '';
    debugInfo.value = `File selected: ${file.name}\nSize: ${formatFileSize(file.size)}\nType: ${file.type}`;
  }
};

const uploadVideo = async (): Promise<void> => {
  if (!isFormValid.value) {
    errorMessage.value = 'Please fill all required fields';
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  errorMessage.value = '';
  
  try {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('video_type', uploadType.value);
    
    if (uploadType.value === 'file' && selectedFile.value) {
      formData.append('video', selectedFile.value);
      console.log('Starting file upload:', selectedFile.value.name);
      debugInfo.value = `Uploading: ${selectedFile.value.name}\nSize: ${formatFileSize(selectedFile.value.size)}`;
    } else if (uploadType.value === 'link' && form.video_url) {
      formData.append('video_url', form.video_url);
      debugInfo.value = `Uploading link: ${form.video_url}`;
    }
    
    // Add progress tracking for file uploads
    const onUploadProgress = (progressEvent: any) => {
      if (progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = progress;
        console.log(`Upload progress: ${progress}%`);
      }
    };

    await videosAPI.uploadVideo(formData, onUploadProgress);
    
    // Reset form
    form.title = '';
    form.description = '';
    form.video_url = '';
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    
    emit('video-uploaded');
    emit('close');
    
  } catch (error: any) {
    console.error('Upload error:', error);
    errorMessage.value = error.response?.data?.error || 'Failed to upload video. Please try again.';
    debugInfo.value = `Error: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`;
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// Add drag and drop functionality
onMounted(() => {
  const dropArea = document.querySelector('.file-drop-area');
  if (dropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e: Event) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
      dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e: DragEvent) {
      const dt = e.dataTransfer;
      const files = dt?.files;
      if (files && files[0]) {
        const file = files[0];
        if (file.type.startsWith('video/')) {
          selectedFile.value = file;
          errorMessage.value = '';
          debugInfo.value = `File dropped: ${file.name}\nSize: ${formatFileSize(file.size)}`;
        } else {
          errorMessage.value = 'Please drop a valid video file';
        }
      }
    }
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
  background: #f0f0f0;
  border-radius: 50%;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e1e1;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.upload-options {
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
}

.option-tabs {
  display: flex;
  background: #f8f9fa;
}

.option-tabs button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.option-tabs button.active {
  background: #007bff;
  color: white;
}

.option-tabs button:not(.active):hover {
  background: #e9ecef;
}

.file-upload,
.link-upload {
  padding: 1.5rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input-wrapper input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-drop-area {
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #f8f9ff;
  transition: all 0.3s;
  cursor: pointer;
}

.file-drop-area:hover,
.file-drop-area.highlight {
  background: #e3f2fd;
  border-color: #0056b3;
}

.file-drop-area p {
  margin: 0;
  color: #007bff;
  font-weight: 500;
}

.file-hint {
  font-size: 0.9rem;
  color: #666 !important;
  margin-top: 0.5rem !important;
}

.file-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.file-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.upload-progress {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e1e1e1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: #e1e1e1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.form-actions button:first-child {
  background: #6c757d;
  color: white;
}

.form-actions button:first-child:hover:not(:disabled) {
  background: #5a6268;
}

.upload-button {
  background: #007bff;
  color: white;
}

.upload-button:hover:not(:disabled) {
  background: #0056b3;
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
}

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e1e1;
  font-size: 0.8rem;
}

.debug-info h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>