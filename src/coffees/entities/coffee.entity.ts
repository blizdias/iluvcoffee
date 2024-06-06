/* eslint-disable prettier/prettier */

import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { Flavor } from './flavor.entity';

@Entity() // SQL table === 'coffee'
export class Coffee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    brand: string;

    @JoinTable()
    @ManyToMany(type => Flavor, flavor => flavor.coffees, { cascade: true, })
    flavors: Flavor[];

    @Column({ default: 0 })
    recommendations: number;
}