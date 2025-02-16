/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/db/entities/user.entitiy';

export class GetUserResponse {
	@ApiProperty({ example: '133a8736-111a-4cf7-ae84-dbe040ad4382', description: 'The user id' })
	readonly id!: string;

	@ApiProperty({ example: 'exampleUser123', description: 'The username' })
	readonly username!: string;

	@ApiProperty({ description: 'The date the user was created', type: 'string', format: 'Date', example: '2024-05-05 17:37:33' })
	readonly createdAt!: Date;

	private constructor(id: string, username: string, createdAt: Date) {
		this.id = id;
		this.username = username;
		this.createdAt = createdAt;
	}

	public static from(user: User) {
		return new GetUserResponse(user.id, user.username, user.createdAt);
	}
}
