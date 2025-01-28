import { UnauthorizedException } from "@nestjs/common";

export class InvalidUsernameException extends UnauthorizedException{
    public constructor() {
        super('Invalid Username');
    }
}