<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">VideoShare</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/">Explore</router-link>
        <template v-if="isAuthenticated">
          <router-link to="/dashboard">Dashboard</router-link>
          <router-link to="/profile">Profile</router-link>
          <button @click="logout" class="logout-btn">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </template>
      </div>
    </nav>
    
    <UploadModal 
      v-if="showUploadModal" 
      @close="showUploadModal = false"
      @video-uploaded="handleVideoUploaded"
    />
    
    <main class="main-content">
      <router-view @open-upload-modal="showUploadModal = true" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import UploadModal from './components/UploadModal.vue';

const store = useStore();
const router = useRouter();
const showUploadModal = ref(false);

const isAuthenticated = computed(() => store.getters.isAuthenticated);

const logout = (): void => {
  store.dispatch('logout');
  router.push('/');
};

const handleVideoUploaded = (): void => {
  showUploadModal.value = false;
  // Refresh the current page to show new video
  router.go(0);
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.navbar {
  background: #fff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff0000;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: #f0f0f0;
}

.nav-links a.router-link-active {
  background-color: #007bff;
  color: white;
}

.logout-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #cc0000;
}

.main-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}
</style>