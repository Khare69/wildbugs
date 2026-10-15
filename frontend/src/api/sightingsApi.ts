import { apiClient } from './client';
import type { Species } from './speciesApi';

export interface Comment {
  id: string;
  sightingId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface Verification {
  id: string;
  sightingId: string;
  userId: string;
  agree: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface Sighting {
  id: string;
  userId: string;
  speciesId: number | null;
  photoUrl: string;
  latitude: number;
  longitude: number;
  aiConfidence: number | null;
  status: string; // 'pending' | 'community_verified' | 'expert_verified'
  notes: string | null;
  createdAt: string;
  species?: Species | null;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  comments?: Comment[];
  verifications?: Verification[];
  _count?: {
    comments: number;
    verifications: number;
  };
}

export interface CandidatePrediction {
  species: Species;
  confidence: number;
}

export interface UploadResponse {
  sighting: Sighting;
  species: Species | null;
  confidence: number;
  candidates?: CandidatePrediction[];
  newBadges?: string[];
  aiModel?: string;
  aiNotes?: string;
}

export async function uploadSighting(formData: FormData): Promise<UploadResponse> {
  const response = await apiClient.post('/sightings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function fetchSightings(params?: {
  userId?: string;
  speciesId?: number;
  timeframe?: string;
  limit?: number;
}): Promise<{ sightings: Sighting[]; count: number }> {
  const response = await apiClient.get('/sightings', { params });
  return response.data;
}

export async function fetchSightingById(id: string): Promise<{
  sighting: Sighting;
  verificationCount: number;
  hasVerified: boolean;
  likeCount: number;
  hasLiked: boolean;
}> {
  const response = await apiClient.get(`/sightings/${id}`);
  return response.data;
}

export async function addComment(sightingId: string, content: string): Promise<{ comment: Comment }> {
  const response = await apiClient.post(`/sightings/${sightingId}/comments`, { content });
  return response.data;
}

export async function toggleVerify(sightingId: string): Promise<{
  verificationCount: number;
  hasVerified: boolean;
  status: string;
}> {
  const response = await apiClient.post(`/sightings/${sightingId}/verify`);
  return response.data;
}

export async function toggleLike(sightingId: string): Promise<{
  likeCount: number;
  hasLiked: boolean;
}> {
  const response = await apiClient.post(`/sightings/${sightingId}/like`);
  return response.data;
}
