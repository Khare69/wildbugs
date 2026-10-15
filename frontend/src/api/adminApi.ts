import { apiClient } from './client';
import type { Sighting } from './sightingsApi';

export interface AdminMetrics {
  totalSightings: number;
  pendingCount: number;
  communityVerifiedCount: number;
  expertVerifiedCount: number;
  verifiedRate: number;
  totalUsers: number;
  totalSpecies: number;
  totalComments: number;
  totalVerifications: number;
  totalLikes: number;
}

export async function fetchAdminMetrics(): Promise<{ metrics: AdminMetrics }> {
  const response = await apiClient.get('/admin/metrics');
  return response.data;
}

export async function fetchPendingVerifications(status?: string): Promise<{ sightings: Sighting[]; count: number }> {
  const params = status ? { status } : {};
  const response = await apiClient.get('/admin/pending-verifications', { params });
  return response.data;
}

export async function expertVerifySighting(
  sightingId: string,
  speciesId?: number
): Promise<{ sighting: Sighting; message: string }> {
  const response = await apiClient.post(`/admin/sightings/${sightingId}/expert-verify`, { speciesId });
  return response.data;
}

export async function deleteSighting(
  sightingId: string
): Promise<{ success: boolean; deletedId: string; message: string }> {
  const response = await apiClient.delete(`/admin/sightings/${sightingId}`);
  return response.data;
}

export async function promoteMe(
  role: 'expert' | 'admin' = 'expert'
): Promise<{ user: any; token: string; message: string }> {
  const response = await apiClient.post('/admin/promote-me', { role });
  return response.data;
}
