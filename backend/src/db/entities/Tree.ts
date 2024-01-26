import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Directory } from 'src/db/entities/Directory';

@Entity({ tableName: 'tree' })
@Unique({ properties: ['parent', 'child'] })
export class Tree {
	@PrimaryKey({ type: 'int', nullable: false, autoincrement: true })
	readonly id!: number;

	@ManyToOne({ entity: () => Directory, nullable: true, default: null, updateRule: 'no action', deleteRule: 'no action' })
	readonly parent!: Directory | null;

	@ManyToOne({ entity: () => Directory, nullable: false, updateRule: 'no action', deleteRule: 'no action' })
	readonly child!: Directory | null;

	@Property({ type: 'int', nullable: false, default: 0 })
	readonly depth!: number;
}
