/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/

import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {
	[OptionalProps]?: 'id' | 'createdAt';

	@PrimaryKey({ type: 'uuid', nullable: false, unique: true, defaultRaw: 'UUID()' })
	readonly id!: string;

	@Property({ type: 'varchar', unique: true, nullable: false })
	readonly username!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly password!: string;

	@Property({ type: 'datetime', defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;
}
