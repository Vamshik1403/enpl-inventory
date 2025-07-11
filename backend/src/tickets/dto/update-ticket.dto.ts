export class UpdateTicketDto {
  title?: string;
  description?: string;
  assignedToId?: number;
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED' | 'REOPENED';
}
