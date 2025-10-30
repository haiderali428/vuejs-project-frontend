<template>
  <div class="profile">
    <h1>Profile Management</h1>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>
    
    <div v-else class="profile-content">
      <!-- Profile Update Section -->
      <div class="profile-form">
        <h2>Update Profile</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>Name</label>
            <input 
              v-model="profile.name" 
              type="text" 
              required
              placeholder="Enter your name"
            >
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="profile.email" 
              type="email" 
              required
              placeholder="Enter your email"
            >
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="updating || !hasChanges"
              class="update-btn"
            >
              {{ updating ? 'Updating...' : 'Update Profile' }}
            </button>
            
            <button 
              type="button" 
              @click="resetForm" 
              :disabled="updating || !hasChanges"
              class="reset-btn"
            >
              Reset
            </button>
          </div>
        </form>
        
        <div v-if="message" class="message" :class="{ error: isError, success: !isError }">
          {{ message }}
        </div>
      </div>

      <!-- Danger Zone Section -->
      <div class="danger-zone">
        <h2>Danger Zone</h2>
        <div class="danger-content">
          <div class="warning-message">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <h3>Delete Account</h3>
              <p>Once you delete your account, there is no going back. This action cannot be undone.</p>
              <ul class="deletion-consequences">
                <li>All your videos will be permanently deleted</li>
                <li>Your profile information will be erased</li>
                <li>You will lose access to all your data</li>
                <li>This action is irreversible</li>
              </ul>
            </div>
          </div>
          
          <button 
            @click="showDeleteConfirmation = true" 
            class="delete-account-btn"
            :disabled="deleting"
          >
            <span v-if="deleting">
              <span class="btn-spinner"></span>
              Deleting...
            </span>
            <span v-else>Delete My Account</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay" @click.self="showDeleteConfirmation = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirm Account Deletion</h2>
          <button class="close-btn" @click="showDeleteConfirmation = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-section">
            <div class="warning-icon-large">⚠️</div>
            <h3>This action cannot be undone</h3>
            <p>You are about to permanently delete your account and all associated data.</p>
          </div>

          <div class="confirmation-check">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="confirmDeletion"
                class="checkbox-input"
              >
              <span class="checkmark"></span>
              I understand that this action is irreversible and I want to proceed with deleting my account.
            </label>
          </div>

          <div class="final-warning">
            <p><strong>Type your email to confirm:</strong></p>
            <input 
              v-model="emailConfirmation" 
              type="email" 
              placeholder="Enter your email address"
              class="email-confirmation-input"
              :class="{ 'match': emailConfirmation === currentUser?.email }"
            >
            <small v-if="emailConfirmation && emailConfirmation !== currentUser?.email" class="email-mismatch">
              Email does not match your current email address
            </small>
          </div>
        </div>

        <div class="modal-actions">
          <button 
            @click="showDeleteConfirmation = false" 
            class="cancel-btn"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="deleteAccount" 
            class="confirm-delete-btn"
            :disabled="!canDeleteAccount || deleting"
          >
            <span v-if="deleting">
              <span class="btn-spinner"></span>
              Deleting Account...
            </span>
            <span v-else>Permanently Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { authAPI } from '../api/auth';
import type { User } from '../types';

const store = useStore();
const router = useRouter();

interface ProfileData {
  name: string;
  email: string;
}

const profile = reactive<ProfileData>({
  name: '',
  email: ''
});

const updating = ref(false);
const loading = ref(true);
const message = ref('');
const isError = ref(false);
const deleting = ref(false);
const showDeleteConfirmation = ref(false);
const confirmDeletion = ref(false);
const emailConfirmation = ref('');

// Computed properties
const currentUser = computed((): User | null => {
  return store.getters.currentUser;
});

const hasChanges = computed((): boolean => {
  if (!currentUser.value) return false;
  return profile.name !== currentUser.value.name || profile.email !== currentUser.value.email;
});

const canDeleteAccount = computed((): boolean => {
  return confirmDeletion.value && emailConfirmation.value === currentUser?.value?.email;
});

// Initialize form with current user data
const initializeForm = (): void => {
  if (currentUser.value) {
    console.log('Initializing form with user:', currentUser.value);
    profile.name = currentUser.value.name;
    profile.email = currentUser.value.email;
  } else {
    console.warn('No current user found in store');
  }
};

// Watch for changes in currentUser and update form
watch(currentUser, (newUser) => {
  if (newUser) {
    console.log('User data updated, refreshing form');
    initializeForm();
  }
});

const resetForm = (): void => {
  initializeForm();
  message.value = '';
  isError.value = false;
};

const updateProfile = async (): Promise<void> => {
  if (!hasChanges.value) {
    message.value = 'No changes to update';
    isError.value = true;
    return;
  }

  updating.value = true;
  message.value = '';
  isError.value = false;
  
  try {
    console.log('Updating profile with:', profile);
    await authAPI.updateProfile(profile);
    
    message.value = 'Profile updated successfully!';
    isError.value = false;
    
    // Update store with new user data
    const updatedUser = { 
      ...currentUser.value, 
      ...profile 
    };
    store.commit('setUser', updatedUser);
    
    console.log('Profile updated successfully, new user data:', updatedUser);
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    message.value = error.response?.data?.error || 'Failed to update profile. Please try again.';
    isError.value = true;
  } finally {
    updating.value = false;
  }
};

const deleteAccount = async (): Promise<void> => {
  if (!canDeleteAccount.value) {
    return;
  }

  deleting.value = true;
  
  try {
    // Use the real API call instead of simulation
    await authAPI.deleteAccount();
    
    // Logout user
    store.dispatch('logout');
    
    // Show success message
    alert('Your account has been successfully deleted. We\'re sorry to see you go!');
    
    // Redirect to home page
    router.push('/');
    
  } catch (error: any) {
    console.error('Account deletion error:', error);
    message.value = error.message || 'Failed to delete account. Please try again.';
    isError.value = true;
    showDeleteConfirmation.value = false;
  } finally {
    deleting.value = false;
    // Reset confirmation modal
    confirmDeletion.value = false;
    emailConfirmation.value = '';
  }
};

// Simulated API call for account deletion
const deleteUserAccount = async (): Promise<void> => {
  // This would be your actual API call
  // For now, we'll simulate a successful deletion
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate random failure (remove in production)
      if (Math.random() < 0.1) { // 10% chance of failure for testing
        reject(new Error('Server error. Please try again.'));
      } else {
        resolve();
      }
    }, 2000);
  });
};

const resetDeleteModal = (): void => {
  confirmDeletion.value = false;
  emailConfirmation.value = '';
};

// Watch for modal close and reset state
watch(showDeleteConfirmation, (newValue) => {
  if (!newValue) {
    resetDeleteModal();
  }
});

onMounted(async () => {
  console.log('Profile component mounted');
  console.log('Current user from store:', currentUser.value);
  
  // Check if user is authenticated
  if (!store.getters.isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    router.push('/login');
    return;
  }

  // If user data is not in store, try to get it from localStorage or redirect
  if (!currentUser.value) {
    console.log('No user data in store, checking localStorage...');
    
    // Try to get user data from localStorage as fallback
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return;
    }
    
    message.value = 'User data not available. Please log in again.';
    isError.value = true;
    loading.value = false;
    return;
  }

  // Initialize form with current user data
  initializeForm();
  loading.value = false;
  
  console.log('Form initialized with:', profile);
});
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-form h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e1e1;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.update-btn {
  flex: 2;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

.update-btn:hover:not(:disabled) {
  background: #0056b3;
}

.reset-btn {
  flex: 1;
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

.reset-btn:hover:not(:disabled) {
  background: #5a6268;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Danger Zone Styles */
.danger-zone {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #dc3545;
}

.danger-zone h2 {
  margin: 0 0 1.5rem 0;
  color: #dc3545;
  border-bottom: 2px solid #dc3545;
  padding-bottom: 0.5rem;
}

.danger-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-text h3 {
  margin: 0 0 0.5rem 0;
  color: #c53030;
}

.warning-text p {
  margin: 0 0 1rem 0;
  color: #744;
  line-height: 1.5;
}

.deletion-consequences {
  margin: 0;
  padding-left: 1.5rem;
  color: #744;
}

.deletion-consequences li {
  margin-bottom: 0.25rem;
}

.delete-account-btn {
  align-self: flex-start;
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-account-btn:hover:not(:disabled) {
  background: #c53030;
  transform: translateY(-1px);
}

.delete-account-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Modal Styles */
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
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e1e1;
}

.modal-header h2 {
  margin: 0;
  color: #dc3545;
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

.modal-body {
  margin-bottom: 2rem;
}

.warning-section {
  text-align: center;
  padding: 1.5rem;
  background: #fff5f5;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.warning-icon-large {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.warning-section h3 {
  margin: 0 0 0.5rem 0;
  color: #c53030;
}

.warning-section p {
  margin: 0;
  color: #744;
}

.confirmation-check {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.checkbox-input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background: white;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}

.checkbox-input:checked + .checkmark {
  background: #dc3545;
  border-color: #dc3545;
}

.checkbox-input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
}

.final-warning {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e1e1;
}

.final-warning p {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.email-confirmation-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e1e1;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.email-confirmation-input:focus {
  outline: none;
  border-color: #dc3545;
}

.email-confirmation-input.match {
  border-color: #28a745;
}

.email-mismatch {
  display: block;
  margin-top: 0.25rem;
  color: #dc3545;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.cancel-btn:hover:not(:disabled) {
  background: #5a6268;
}

.confirm-delete-btn {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #c53030;
}

.confirm-delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }
  
  .profile-form,
  .danger-zone {
    padding: 1.5rem;
  }
  
  .form-actions,
  .modal-actions {
    flex-direction: column;
  }
  
  .update-btn,
  .reset-btn,
  .cancel-btn,
  .confirm-delete-btn {
    width: 100%;
  }
  
  .warning-message {
    flex-direction: column;
    text-align: center;
  }
}
</style>