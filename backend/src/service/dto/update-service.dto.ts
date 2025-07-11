import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {

  @IsNotEmpty()
  @IsString()
  serviceSkuId: string;

  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsNotEmpty()
  @IsString()
  serviceDescription: string;

  @IsNotEmpty()
  @IsString()
  SAC: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

   @IsNotEmpty()
    @IsInt()
    serviceCategoryId?:number;
  
    @IsNotEmpty()
    @IsInt()
    serviceSubCategoryId?: number;
}
