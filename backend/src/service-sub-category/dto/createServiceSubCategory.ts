import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSubCategoryDto {

  @IsNotEmpty()
  @IsString()
  serviceSubCatId: string;

  @IsOptional()
  @IsString()
  subCategoryName: string;

  @IsOptional()
  @IsNumber()
  serviceCategoryId: number; 
}
