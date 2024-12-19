import { IsNumber } from 'class-validator';

export class LocationDto {
  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;
}