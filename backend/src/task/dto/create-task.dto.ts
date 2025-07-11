import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsInt()
  @IsNotEmpty()
  siteId: number;

  @IsNotEmpty()
  workScope: string;

  @IsNotEmpty()
  proposedDate: string;

  @IsNotEmpty()
  priority: string;

  @IsNotEmpty()
  status: string;

  @IsInt()
  @IsNotEmpty()
  hodId: number;

  @IsInt()
  @IsOptional()
  managerId?: number;

  @IsInt()
  @IsOptional()
  executiveId?: number;

  @IsNotEmpty()
  remark: string;
}
