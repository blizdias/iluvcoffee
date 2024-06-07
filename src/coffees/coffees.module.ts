/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigModule } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Module({
    imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event]), ConfigModule.forFeature(coffeesConfig)],
    controllers: [CoffeesController],
    providers: [CoffeesService, {
        provide: COFFEE_BRANDS, // 👈
        useFactory: async () => ['buddy brew', 'nescafe'] // array of coffee brands, useFactory allows us to create a factory provider
    },],
    exports: [CoffeesService]
})
export class CoffeesModule { }
