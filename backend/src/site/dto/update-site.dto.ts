import {
  IsOptional,
  IsString,
  IsEmail,
  IsArray,
} from 'class-validator';

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteAddress?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gstNo?: string;

  @IsOptional()
  @IsString()
  gstpdf?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactName?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contactNumber?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emailId?: string[];

  @IsOptional()
  customerId?: number;
}
