/**
 * API service -- Axios instance with JWT interceptor + all API functions.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
      // Only redirect if not already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getStats = () => api.get('/admin/stats');
export const addVoter = (full_name, email) =>
  api.post('/admin/voters', { full_name, email });
export const getVoters = () => api.get('/admin/voters');
export const deleteVoter = (id) => api.delete(`/admin/voters/${id}`);

// ── Elections ─────────────────────────────────────────────────────────────────
export const getElections = (status) =>
  api.get('/elections', { params: status ? { status } : {} });
export const getElection = (id) => api.get(`/elections/${id}`);
export const createElection = (data) => api.post('/elections', data);
export const publishElection = (id) => api.put(`/elections/${id}/publish`);
export const endElection = (id) => api.put(`/elections/${id}/end`);
export const getResults = (id) => api.get(`/elections/${id}/results`);

// ── Candidates ────────────────────────────────────────────────────────────────
export const applyAsCandidate = (electionId, data) =>
  api.post(`/elections/${electionId}/apply`, data);
export const getCandidates = (electionId) =>
  api.get(`/elections/${electionId}/candidates`);

// ── Voting ────────────────────────────────────────────────────────────────────
export const requestOtp = (election_id) =>
  api.post('/vote/request-otp', { election_id });
export const castVote = (data) => api.post('/vote/cast', data);
export const getReceipt = (code) => api.get(`/vote/receipt/${code}`);
export const getMyVotes = (electionId) =>
  api.get(`/vote/my-votes/${electionId}`);

export default api;
