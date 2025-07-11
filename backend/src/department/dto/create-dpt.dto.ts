//src/users/dto/create-dpt.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
    @IsString()
    @IsNotEmpty()
    departmentName: string;
  }