import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerContactDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  contactPhoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  contactEmailId: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  landlineNumber?: string;
}

class CustomerBankDetailDto {
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  ifscCode: string;

  @IsNotEmpty()
  @IsString()
  branchName: string;
}

export class UpdateCustomerDto {
 

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  registerAddress: string;

  @IsNotEmpty()
  @IsString()
  gstNo: string;

  @IsNotEmpty()
  @IsString()
  gstpdf: string;

  @IsNotEmpty()
  @IsEmail()
  emailId: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[]; 

  @IsNotEmpty()
  @IsString()
  creditTerms: string;

  @IsNotEmpty()
  @IsString()
  creditLimit: string;

  @IsNotEmpty()
  @IsString()
  remark: string;

  @IsOptional()
  @IsInt()
  hodId?: number;

  @IsOptional()
  @IsInt()
  managerId?: number;

  @IsOptional()
  @IsInt()
  executiveId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomerContactDto)
  contacts: CustomerContactDto[];

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => CustomerBankDetailDto)
bankDetails?: CustomerBankDetailDto[];
}
