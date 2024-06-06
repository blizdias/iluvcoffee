/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { COFFEE_BRANDS } from './coffees.constants'
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable()
export class CoffeesService {
    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
        private readonly dataSource: DataSource,
        @Inject(COFFEE_BRANDS) coffeeBrands: string[],
        @Inject(coffeesConfig.KEY)
        private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
        private readonly configService: ConfigService,
    ) {

        console.log(coffeesConfiguration.foo);
    }

    findAll(paginationQuery: PaginationQueryDto) {
        const { limit, offset } = paginationQuery;
        return this.coffeeRepository.find({
            relations: {
                flavors: true
            },
            skip: offset,
            take: limit,
        });
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne(
            {
                where: { id: +id },
                relations: { flavors: true }
            },
        );
        if (!coffee) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createCoffeeDto: CreateCoffeeDto) {
        const flavors = await Promise.all( // Promise.all waits for all promises to resolve
            createCoffeeDto.flavors.map(name => this.preloadFlavorsByName(name)) // search for flavors in DB and preload them
        );

        const coffee = this.coffeeRepository.create({
            ...createCoffeeDto, // spread operator to copy all properties from createCoffeeDto
            flavors, // assign flavors to the coffee entity
        });
        return this.coffeeRepository.save(coffee);
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {

        const flavors = await Promise.all( // Promise.all waits for all promises to resolve
            updateCoffeeDto.flavors.map(name => this.preloadFlavorsByName(name)) // search for flavors in DB and preload them
        );

        const coffee = await this.coffeeRepository.preload({ id: +id, ...updateCoffeeDto, flavors }) // preload always returns null if not in the database
        if (!coffee) {
            throw new NotFoundException(`Coffee ${id} not found.`);
        }
        return this.coffeeRepository.save(coffee);
    }

    async remove(id: string) {
        const coffee = await this.findOne(id); // find one method automatically retrives an error if not find any id in DB
        return this.coffeeRepository.remove(coffee);
    }

    async recommendCoffee(coffee: Coffee) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            coffee.recommendations++;

            const recommendEvent = new Event();
            recommendEvent.name = 'recommend_coffee';
            recommendEvent.type = 'coffee';
            recommendEvent.payload = { coffeeId: coffee.id };

            await queryRunner.manager.save(coffee);
            await queryRunner.manager.save(recommendEvent);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    // Add a new flavor to a coffee - if flavor does not exit it creates a new one in DB
    private async preloadFlavorsByName(name: string): Promise<Flavor> {
        const existingFlavor = await this.flavorRepository.findOne({
            where: { name },
        });
        if (existingFlavor) {
            return existingFlavor;
        }
        return this.flavorRepository.create({ name });
    }
}