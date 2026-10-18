export type ElevatorStatus =
  | 'A_PLANIFIER'
  | 'EN_INSTALLATION'
  | 'INSTALLE'
  | 'EN_MAINTENANCE'
  | 'HORS_SERVICE';

export const ELEVATOR_STATUSES: ElevatorStatus[] = [
  'A_PLANIFIER',
  'EN_INSTALLATION',
  'INSTALLE',
  'EN_MAINTENANCE',
  'HORS_SERVICE'
];

export interface Elevator {
  id?: string;
  reference: string;
  model?: string;
  capacity: number;
  numberOfFloors: number;
  status: ElevatorStatus;
  projectId: string;
  lastMaintenanceDate?: string | null;
  maintenanceIntervalDays?: number | null;
}

export type MaintenanceState = 'OVERDUE' | 'DUE_SOON' | 'OK';

export interface ElevatorMaintenanceStatus {
  id: string;
  reference: string;
  projectId: string;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string;
  maintenanceState: MaintenanceState;
}
