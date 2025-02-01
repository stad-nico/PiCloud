/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/mariadb';

import { Directory } from 'src/db/entities/directory.entity';

export const TREE_TABLE_NAME = 'tree';

@Entity({ tableName: TREE_TABLE_NAME, repository: () => TreeRepository })
@Unique({ properties: ['parent', 'child'] })
export class Tree {
	[EntityRepositoryType]?: TreeRepository;

	@PrimaryKey({ type: 'int', nullable: false, autoincrement: true })
	readonly id!: number;

	@ManyToOne({ entity: () => Directory, nullable: true, default: null, updateRule: 'no action', deleteRule: 'cascade', name: 'parentId' })
	readonly parent!: Directory | null;

	@ManyToOne({ entity: () => Directory, nullable: false, updateRule: 'no action', deleteRule: 'cascade', name: 'childId' })
	readonly child!: Directory | null;

	@Property({ type: 'int', nullable: false, default: 0 })
	readonly depth!: number;
}

export class TreeRepository extends EntityRepository<Tree> {}
