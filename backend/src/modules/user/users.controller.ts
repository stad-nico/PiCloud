import { Controller, Get, UseGuards, Post, Body, Request } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/createUser.dto";
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
  }
}

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    @UseGuards(AuthGuard)
    async getUser(@Request() req: RequestWithUser) {
        const userId = req.user.id;
        return await this.usersService.findOneById(userId);
    }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.createUser(createUserDto);
    }
}