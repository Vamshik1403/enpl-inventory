import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateSubCategoryDto {

  
  @IsNotEmpty()
  @IsString()
  subCategoryName: string;

  @IsOptional()
  @IsNumber()
  serviceCategoryId?: number; 

  @IsOptional()
  @IsString()
  serviceSubCatId: string; 
}
