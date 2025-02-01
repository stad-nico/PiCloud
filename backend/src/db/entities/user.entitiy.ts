/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { Entity, EntityRepositoryType, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { UserRepository } from 'src/modules/users/user.repository';
import { v4 } from 'uuid';

@Entity({ tableName: 'users', repository: () => UserRepository })
export class User {
	[OptionalProps]?: 'id' | 'createdAt';
	[EntityRepositoryType]?: UserRepository;

	@PrimaryKey({ type: 'uuid', nullable: false, unique: true, defaultRaw: 'UUID()' })
	readonly id: string = v4();

	@Property({ type: 'varchar', unique: true, nullable: false })
	readonly username!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly password!: string;

	@Property({ type: 'datetime', defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;
}
