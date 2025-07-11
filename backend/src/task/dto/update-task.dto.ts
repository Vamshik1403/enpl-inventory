import { IsNotEmpty, IsString,IsInt, IsOptional } from 'class-validator';

export class UpdateTaskDto {
  @IsNotEmpty()
  @IsInt()
  serviceId: number;

  @IsNotEmpty()
  @IsInt()
  departmentId: number;

  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @IsNotEmpty()
  @IsInt()
  siteId: number;

  @IsNotEmpty()
  @IsString()
  workScope: string; 

  @IsNotEmpty()
  @IsString()
  proposedDate: string;
  
  @IsNotEmpty()
  @IsString() 
  priority : string;

  @IsNotEmpty()
  @IsString()
  remark: string; 

  @IsNotEmpty()
  @IsString()
  status: string; 

  @IsInt()
  hodId: number;

  @IsInt()
  @IsOptional()
  managerId?: number;

  @IsInt()
  @IsOptional()
  executiveId?: number;
  
}
