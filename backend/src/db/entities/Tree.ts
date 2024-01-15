import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tree' })
export class Tree {
	@PrimaryKey({ type: 'int', nullable: false, autoincrement: true })
	readonly id!: number;

	@Property({ type: 'varchar', nullable: true, default: null })
	readonly parent!: string | null;

	@Property({ type: 'varchar', nullable: false })
	readonly child!: string;

	@Property({ type: 'int', nullable: false, default: 0 })
	readonly depth!: number;
}
