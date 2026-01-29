import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Product } from '../modules/products/entities/product.entity';
import { Sale } from '../modules/sales/entities/sale.entity';
import { SaleItem } from '../modules/sales/entities/sale-item.entity';
import { User } from '../modules/auth/entities/user.entity';
import { ValidRoles } from '../modules/auth/interfaces/valid-roles';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        @InjectRepository(SaleItem)
        private readonly saleItemRepository: Repository<SaleItem>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async run() {
        try {
            await this.cleanDatabase();
            await this.seedUsers();
            await this.seedProductsAndSales();
            return 'SEED EXECUTED';
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    private async cleanDatabase() {
        await this.saleItemRepository.createQueryBuilder().delete().execute();
        await this.saleRepository.createQueryBuilder().delete().execute();
        await this.productRepository.createQueryBuilder().delete().execute();
        await this.userRepository.createQueryBuilder().delete().execute();
    }

    private async seedUsers() {
        const password = bcrypt.hashSync('123456aB#', 10);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@kfe.com',
                password: password,
                role: ValidRoles.admin,
            },
            {
                name: 'Manager User',
                email: 'manager@kfe.com',
                password: password,
                role: ValidRoles.manager,
            },
            {
                name: 'Cashier User',
                email: 'cashier@kfe.com',
                password: password,
                role: ValidRoles.cashier,
            },
        ];

        await this.userRepository.save(users);
    }

    private async seedProductsAndSales() {
        const products: Product[] = [];
        const coffeeNames = [
            'Espresso',
            'Americano',
            'Latte',
            'Cappuccino',
            'Mocha',
            'Macchiato',
            'Flat White',
            'Affogato',
            'Irish Coffee',
            'Frappé',
            'Iced Coffee',
            'Cold Brew',
            'Nitro Coffee',
            'Turkish Coffee',
            'Cortado',
            'Ristretto',
            'Lungo',
            'Doppio',
            'Galão',
            'Red Eye',
            'Black Eye',
            'Dripped Eye',
            'Lazy Eye',
            'Dead Eye',
            'Caffè Breve',
            'Café au Lait',
            'Café con Leche',
            'Café de Olla',
            'Caramel Macchiato',
            'Hazelnut Latte',
            'Vanilla Latte',
            'Pumpkin Spice Latte',
            'Peppermint Mocha',
            'White Chocolate Mocha',
            'Chai Latte',
            'Dirty Chai',
            'Matcha Latte',
            'Golden Turmeric Latte',
            'London Fog',
            'Earl Grey Tea',
            'Green Tea',
            'Black Tea',
            'Chamomile Tea',
            'Peppermint Tea',
            'Ginger Tea',
            'Lemon Tea',
            'Peach Tea',
            'Raspberry Tea',
            'Blueberry Tea',
            'Strawberry Tea',
        ];

        for (let i = 0; i < 50; i++) {
            const name = coffeeNames[i] || `Product ${i + 1}`;
            const product = this.productRepository.create({
                name,
                price: parseFloat((Math.random() * 10 + 2).toFixed(2)),
                stock: Math.floor(Math.random() * 1000) + 100,
                isActive: true,
            });
            products.push(await this.productRepository.save(product));
        }

        for (const product of products) {
            for (let i = 0; i < 10; i++) {
                const quantity = Math.floor(Math.random() * 5) + 1;
                const total = parseFloat((product.price * quantity).toFixed(2));

                const sale = this.saleRepository.create({
                    total,
                    items: [],
                });

                const savedSale = await this.saleRepository.save(sale);

                const saleItem = this.saleItemRepository.create({
                    quantity,
                    price: product.price,
                    sale: savedSale,
                    product: product,
                });

                await this.saleItemRepository.save(saleItem);
            }
        }
    }
}
