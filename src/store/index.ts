import { createStore } from 'vuex';
import { AuthState, User } from '../types';

// Try to load user from localStorage
const savedUser = localStorage.getItem('user');
const initialUser = savedUser ? JSON.parse(savedUser) : null;

export default createStore<AuthState>({
  state: {
    user: initialUser,
    token: localStorage.getItem('token') || null
  },
  mutations: {
    setUser(state: AuthState, user: User) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    setToken(state: AuthState, token: string) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    logout(state: AuthState) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const { authAPI } = await import('../api/auth');
        const response = await authAPI.login(credentials);
        commit('setToken', response.token);
        commit('setUser', response.user);
        return response;
      } catch (error) {
        throw error;
      }
    },
    async register({ commit }, userData) {
      try {
        const { authAPI } = await import('../api/auth');
        const response = await authAPI.register(userData);
        commit('setToken', response.token);
        commit('setUser', response.user);
        return response;
      } catch (error) {
        throw error;
      }
    },
    logout({ commit }) {
      commit('logout');
    }
  },
  getters: {
    isAuthenticated: (state: AuthState) => !!state.token,
    currentUser: (state: AuthState) => state.user
  }
});