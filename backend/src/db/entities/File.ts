import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { Directory } from 'src/db/entities/Directory';

export const FILES_TABLE_NAME = 'files';

@Entity({ tableName: FILES_TABLE_NAME })
export class File {
	[OptionalProps]?: 'id' | 'parent' | 'mimeType' | 'size' | 'isRecycled' | 'createdAt' | 'updatedAt';

	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: true, default: null, updateRule: 'no action', deleteRule: 'no action', name: 'parentId' })
	readonly parent!: Directory | null;

	@Property({ type: 'varchar', nullable: false, default: 'application/octet-stream' })
	readonly mimeType!: string;

	@Property({ type: 'bigint', nullable: false, default: 0 })
	readonly size!: number;

	@Property({ type: 'boolean', nullable: false, default: false })
	readonly isRecycled!: boolean;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp() on update current_timestamp()' })
	readonly updatedAt!: Date;
}
