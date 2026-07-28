import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/** Point a slot at an uploaded file. Images must carry their intrinsic size. */
export class SetSiteMediaDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @IsOptional()
  @IsString()
  fileName?: string | null;
}
