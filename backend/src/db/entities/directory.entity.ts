/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Entity, EntityRepositoryType, ManyToOne, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { DirectoriesRepository } from 'src/modules/directories/directories.repository';
import { v4 } from 'uuid';
import { User } from './user.entitiy';

export const ROOT_ID = 'root';
export const DIRECTORY_TABLE_NAME = 'directories';

@Entity({ tableName: DIRECTORY_TABLE_NAME, repository: () => DirectoriesRepository })
@Unique({ properties: ['parent', 'name'] })
export class Directory {
	[OptionalProps]?: 'id' | 'parent' | 'createdAt' | 'updatedAt';
	[EntityRepositoryType]?: DirectoriesRepository;

	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id: string = v4();

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: true, default: null, updateRule: 'no action', deleteRule: 'cascade', name: 'parentId' })
	readonly parent!: Directory | null;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()', extra: 'on update current_timestamp()' })
	readonly updatedAt!: Date;

	@ManyToOne({ entity: () => User, nullable: false, name: 'userId' })
	readonly user!: User;
}
