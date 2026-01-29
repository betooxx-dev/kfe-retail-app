import { IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({
        description: 'The name of the user',
        example: 'John Doe',
        minLength: 1
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com',
        uniqueItems: true
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'Secret123!',
        minLength: 9,
        maxLength: 20
    })
    @IsString()
    @MinLength(9)
    @MaxLength(20)
    @IsStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password: string;

    @ApiProperty({
        description: 'The role of the user (admin, user, super-user)',
        example: 'user',
        default: 'user',
        required: false
    })
    @IsOptional()
    @IsString()
    role: string;
}