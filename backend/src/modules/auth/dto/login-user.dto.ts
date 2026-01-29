import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com'
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
}