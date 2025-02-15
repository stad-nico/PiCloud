import { IsString, MinLength } from "class-validator";

export class LoginDto {

    @IsString()
    @MinLength(3)
    public readonly username!: string;

    @IsString()
    @MinLength(4)
    public readonly password!: string;
}