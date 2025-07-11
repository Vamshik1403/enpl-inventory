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

class ProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  subCategory: string;
}

export class CreateCustomerDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto) // Create a ProductDto class for individual product properties
  products?: ProductDto[];


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
  @IsString()
  businessType: string;
  
  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsEmail()
  emailId: string;

  @IsOptional()
  @IsString()
  website?: string;

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

 @IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => CustomerContactDto)
contacts?: CustomerContactDto[];

@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => CustomerBankDetailDto)
bankDetails?: CustomerBankDetailDto[];

}
