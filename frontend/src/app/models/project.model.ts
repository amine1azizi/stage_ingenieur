export type ProjectStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE';

export const PROJECT_STATUSES: ProjectStatus[] = ['PLANIFIE', 'EN_COURS', 'TERMINE'];

export interface Project {
  id?: string;
  name: string;
  address?: string;
  clientId: string;
  status: ProjectStatus;
  numberOfElevators: number;
  latitude?: number | null;
  longitude?: number | null;
}
