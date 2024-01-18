import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Directory } from 'src/db/entities/Directory';

@Entity({ tableName: 'files' })
export class File {
	@PrimaryKey({ type: 'uuid', nullable: false, defaultRaw: 'UUID()', unique: true })
	readonly id!: string;

	@Property({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne({ entity: () => Directory, nullable: true, updateRule: 'no action', deleteRule: 'no action' })
	readonly parent!: Directory | null;

	@Property({ type: 'varchar', nullable: false, default: 'application/octet-stream' })
	readonly mimeType!: string;

	@Property({ type: 'bigint', nullable: false, default: 0 })
	readonly size!: number;

	@Property({ type: 'boolean', nullable: false, default: false })
	readonly isRecycled!: boolean;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'CURRENT_TIMESTAMP()' })
	readonly createdAt!: Date;

	@Property({ type: 'datetime', nullable: false, defaultRaw: 'CURRENT_TIMESTAMP()', onUpdate: () => 'CURRENT_TIMESTAMP()' })
	readonly updatedAt!: Date;
}
