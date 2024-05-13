/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';

import { Directory } from 'src/db/entities/Directory';

export const FILES_TABLE_NAME = 'files';

@Entity({ tableName: FILES_TABLE_NAME })
@Unique({ properties: ['parent', 'name'] })
export class File {
	[OptionalProps]?: 'id' | 'parent' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt';

	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: false, default: 'root', updateRule: 'no action', deleteRule: 'cascade', name: 'parentId' })
	readonly parent!: Directory | null;

	@Property({ type: 'varchar', nullable: false, default: 'application/octet-stream' })
	readonly mimeType!: string;

	@Property({ type: 'bigint', nullable: false, default: 0 })
	readonly size!: number;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()', extra: 'on update current_timestamp()' })
	readonly updatedAt!: Date;
}
