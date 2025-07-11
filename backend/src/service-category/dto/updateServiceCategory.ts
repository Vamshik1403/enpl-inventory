import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateCategoryDto {

    @IsNotEmpty()
    @IsString()
    serviceCatId: string;
    
  @IsNotEmpty()
  @IsString()
  categoryName: string;

  @IsOptional()
  subCategories: { subCategoryName: string }[];
}
