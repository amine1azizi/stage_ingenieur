export type InterventionStatus = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE';

export const INTERVENTION_STATUSES: InterventionStatus[] = ['PLANIFIEE', 'EN_COURS', 'TERMINEE'];

export interface Intervention {
  id?: string;
  elevatorId: string;
  technicianId: string;
  type?: string;
  description?: string;
  date?: string;
  status: InterventionStatus;
}
