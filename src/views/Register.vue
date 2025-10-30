<template>
  <div class="auth-page">
    <div class="auth-form">
      <h1>Register</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label>Name</label>
          <input v-model="userData.name" type="text" required>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input v-model="userData.email" type="email" required>
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input v-model="userData.password" type="password" required>
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        
        <p class="auth-link">
          Already have an account? <router-link to="/login">Login</router-link>
        </p>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { RegisterData } from '../types';

const store = useStore();
const router = useRouter();

const userData = reactive<RegisterData>({
  name: '',
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

const register = async (): Promise<void> => {
  loading.value = true;
  error.value = '';
  
  try {
    await store.dispatch('register', userData);
    router.push('/dashboard');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-form h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  color: #666;
}

.auth-link a {
  color: #007bff;
  text-decoration: none;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>