import { apiClient } from './client';

export interface Challenge {
  id: number;
  title: string;
  description: string;
  targetCount: number;
  speciesFamily: string | null;
  startsAt: string;
  endsAt: string;
  daysRemaining: number;
  totalParticipants: number;
  userProgress: {
    progress: number;
    completed: boolean;
  } | null;
}

export async function fetchChallenges(): Promise<{ challenges: Challenge[] }> {
  const response = await apiClient.get('/challenges');
  return response.data;
}

export async function joinChallenge(challengeId: number): Promise<{ progress: any }> {
  const response = await apiClient.post(`/challenges/${challengeId}/join`);
  return response.data;
}
