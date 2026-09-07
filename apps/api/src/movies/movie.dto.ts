import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty() @IsString() @Length(1, 200) title!: string;
  @ApiProperty() @IsString() @Length(20, 5000) synopsis!: string;
  @ApiProperty() @IsDateString() releaseDate!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(1000) runtimeMinutes!: number;
  @IsOptional() @IsString() @Length(1, 20) contentRating?: string;
  @ApiProperty() @IsUrl({ require_tld: false }) posterUrl!: string;
  @IsOptional() @IsUrl({ require_tld: false }) backdropUrl?: string;
  @ApiProperty() @IsNumber() @Min(0) @Max(10) averageRating!: number;
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsUUID('4', { each: true })
  directorIds!: string[];
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsUUID('4', { each: true })
  genreIds!: string[];
}
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

export class MovieQueryDto {
  @IsOptional() @IsString() @Length(1, 100) q?: string;
  @IsOptional() @IsString() genre?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1888) yearFrom?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1888) yearTo?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(10) ratingMin?: number;
  @IsOptional() @IsString() sort: 'title' | 'newest' | 'rating' = 'title';
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) offset = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(48) limit = 24;
}
