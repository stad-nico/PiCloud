/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './user.entitiy';

export const ROOT_ID = 'root';
export const DIRECTORY_TABLE_NAME = 'directories';

@Entity({ tableName: DIRECTORY_TABLE_NAME })
@Unique({ properties: ['parent', 'name'] })
export class Directory {
	[OptionalProps]?: 'id' | 'parent' | 'createdAt' | 'updatedAt';

	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: true, default: 'root', updateRule: 'no action', deleteRule: 'cascade', name: 'parentId' })
	readonly parent!: Directory | null;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()', extra: 'on update current_timestamp()' })
	readonly updatedAt!: Date;

	@ManyToOne(() => User, { nullable: false })
	directory_owner!: User;
}
