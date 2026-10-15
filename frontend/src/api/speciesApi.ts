import { apiClient } from './client';

export interface Species {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  habitat: string;
  diet: string;
  lifecycle: string;
  imageUrl: string;
  conservationStatus: string;
}

export async function fetchSpecies(search?: string): Promise<{ species: Species[]; count: number }> {
  const params = search ? { search } : {};
  const response = await apiClient.get('/species', { params });
  return response.data;
}

export async function fetchSpeciesById(id: number | string): Promise<{ species: Species }> {
  const response = await apiClient.get(`/species/${id}`);
  return response.data;
}
