import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsInt()
  ticketId: number;

  @IsInt()
  senderId: number;

  @IsOptional()
  @IsEnum(TicketStatus)
  ticketStatus?: TicketStatus;
}
