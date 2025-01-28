import { UnauthorizedException } from "@nestjs/common";

export class InvalidPasswordException extends UnauthorizedException{
    public constructor() {
        super('Invalid Password');
    }
}