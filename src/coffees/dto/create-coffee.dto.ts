/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCoffeeDto {
    @ApiProperty({ description: 'The name of a coffee.' })
    @IsString()
    readonly name: string;

    @ApiProperty({ description: 'Brand of the coffee.' })
    @IsString()
    readonly brand: string;

    @ApiProperty({ example: ['sweet', 'medium', 'strong'] })
    @IsString({ each: true })
    readonly flavors: string[];
}


