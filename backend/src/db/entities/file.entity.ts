/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Entity, EntityRepositoryType, ManyToOne, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';

import { Directory } from 'src/db/entities/directory.entity';
import { FileRepository } from 'src/modules/files/file.repository';
import { v4 } from 'uuid';
import { User } from './user.entitiy';

export const FILES_TABLE_NAME = 'files';

@Entity({ tableName: FILES_TABLE_NAME, repository: () => FileRepository })
@Unique({ properties: ['parent', 'name'] })
export class File {
	[OptionalProps]?: 'id' | 'createdAt' | 'updatedAt';
	[EntityRepositoryType]?: FileRepository;

	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id: string = v4();

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: false, updateRule: 'no action', deleteRule: 'cascade', name: 'parentId' })
	readonly parent!: Directory;

	@Property({ type: 'varchar', nullable: false })
	readonly mimeType!: string;

	@Property({ type: 'bigint', nullable: false })
	readonly size!: number;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()', extra: 'on update current_timestamp()' })
	readonly updatedAt!: Date;

	@ManyToOne({ entity: () => User, nullable: false, name: 'userId' })
	readonly user!: User;
}
