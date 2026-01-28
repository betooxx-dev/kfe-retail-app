import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerUserDto: RegisterUserDto) {
        try {
            const { password, ...userData } = registerUserDto;

            const user = await this.userRepository.save({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });

            return {
                message: 'Register success',
                token: this.getToken({ id: user.id }),
            };
        } catch (error) {
            console.log(error);
            throw new BadRequestException('Something went wrong' + error.message);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        try {
            const { email, password } = loginUserDto;

            const user = await this.userRepository.findOne({
                where: { email },
                select: ['id', 'password'],
            });

            if (!user) throw new UnauthorizedException('Invalid credentials (id)');

            if (!bcrypt.compareSync(password, user.password))
                throw new UnauthorizedException('Invalid credentials (password)');

            return {
                message: 'Login success',
                token: this.getToken({ id: user.id }),
            };
        } catch (error) {
            console.log(error);
            throw new BadRequestException('Something went wrong' + error.message);
        }
    }

    private getToken = (payload: { id: string }) => {
        return this.jwtService.sign(payload);
    };
}