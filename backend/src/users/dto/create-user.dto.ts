import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  userType: string;

  @IsNotEmpty()
  contactNumber: string;

  @IsNotEmpty()
  emailId: string;

  @IsInt()
  @IsNotEmpty()
  departmentIds: number[];

  @IsInt()
  @IsOptional()
  hodId?: number; 

  @IsInt()
  @IsOptional()
  managerId?: number; 
}
