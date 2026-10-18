export function statusLabel(value: string | undefined): string {
  if (!value) {
    return '-';
  }
  return value.replaceAll('_', ' ');
}

export function projectBadge(status: string | undefined): string {
  switch (status) {
    case 'PLANIFIE':
      return 'text-bg-warning';
    case 'EN_COURS':
      return 'text-bg-primary';
    case 'TERMINE':
      return 'text-bg-success';
    default:
      return 'text-bg-secondary';
  }
}

export function elevatorBadge(status: string | undefined): string {
  switch (status) {
    case 'A_PLANIFIER':
      return 'text-bg-secondary';
    case 'EN_INSTALLATION':
      return 'text-bg-warning';
    case 'INSTALLE':
      return 'text-bg-success';
    case 'EN_MAINTENANCE':
      return 'text-bg-info';
    case 'HORS_SERVICE':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}

export function interventionBadge(status: string | undefined): string {
  switch (status) {
    case 'PLANIFIEE':
      return 'text-bg-warning';
    case 'EN_COURS':
      return 'text-bg-primary';
    case 'TERMINEE':
      return 'text-bg-success';
    default:
      return 'text-bg-secondary';
  }
}
