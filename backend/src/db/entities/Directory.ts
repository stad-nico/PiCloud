import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

export const DIRECTORY_TABLE_NAME = 'directories';

@Entity({ tableName: DIRECTORY_TABLE_NAME })
export class Directory {
	[OptionalProps]?: 'id' | 'parent' | 'isRecycled' | 'createdAt' | 'updatedAt';

	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: true, default: null, updateRule: 'no action', deleteRule: 'no action', name: 'parentId' })
	readonly parent!: Directory | null;

	@Property({ type: 'boolean', nullable: false, default: false })
	readonly isRecycled!: boolean;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'current_timestamp() on update current_timestamp()' })
	readonly updatedAt!: Date;
}
