//src/users/dto/update-dpt.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDepartmentDto {
    @IsString()
    @IsNotEmpty()
    departmentName: string;
  }
