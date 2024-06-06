/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import { CoffeeRefactor1717586688343 } from './src/migrations/1717586688343-CoffeeRefactor';

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'pass123',
    database: 'postgres',
    entities: [],
    migrations: [CoffeeRefactor1717586688343],
});
