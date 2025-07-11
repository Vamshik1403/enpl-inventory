import {
  IsString,
  IsDateString,
  IsInt,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateContractInventoryDto {
  @IsString()
  inventoryType: string;

  @IsString()
  inventoryName: string;

  @IsString()
  productName: string;

  @IsString()
  serialno: string;

  @IsString()
  macAddress: string;

  @IsDateString()
  dateOfPurchase: string;

  @IsString()
  remark: string;
}

export class CreateServiceContractDto {
  @IsInt()
  customerId: number;

  @IsInt()
  siteId: number;

  @IsString()
  relmanager: string;

  @IsString()
  serviceCategory: string;

  @IsString()
  contractNo: string;

  @IsDateString()
  startDate: string;
  
  @IsDateString()
  endDate: string;

  @IsString()
  @Transform(({ value }) => String(value))
  visitSite: string;
  
  @IsString()
  @Transform(({ value }) => String(value))
  maintenanceVisit: string;

  @IsString()
  contractDescription: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContractInventoryDto)
  contractInventories?: CreateContractInventoryDto[];
}
