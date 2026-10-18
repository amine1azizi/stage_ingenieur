export type MaintenanceRequestStatus = 'REQUESTED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

export const MAINTENANCE_REQUEST_STATUSES: MaintenanceRequestStatus[] = [
  'REQUESTED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED'
];

export interface MaintenanceRequest {
  id: string;
  clientId: string;
  elevatorId: string;
  description: string;
  status: MaintenanceRequestStatus;
  createdAt: string;
}
