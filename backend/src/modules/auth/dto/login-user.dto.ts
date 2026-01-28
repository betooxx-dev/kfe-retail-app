import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsEmail()
    email: string;

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