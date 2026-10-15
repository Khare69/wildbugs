import { apiClient } from './client';
import type { Sighting } from './sightingsApi';

export interface LeaderboardUser {
  id: string;
  name: string;
  totalSightings: number;
  speciesFound: number;
  badgesCount?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

export interface UserStatsResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  badges: Badge[];
  totalSightings: number;
  speciesFound: number;
  recentSightings: Sighting[];
}

export async function fetchLeaderboard(): Promise<{ leaderboard: LeaderboardUser[] }> {
  const response = await apiClient.get('/users/leaderboard');
  return response.data;
}

export async function fetchUserStats(userId: string): Promise<UserStatsResponse> {
  const response = await apiClient.get(`/users/${userId}/stats`);
  return response.data;
}

export function getExportJournalUrl(userId: string): string {
  return `http://localhost:3001/api/users/${userId}/export`;
}
