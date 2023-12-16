import { Entity } from '@mikro-orm/core';
import { BaseEntity } from 'src/db/entities/BaseEntity';

@Entity({ tableName: 'directories' })
export class Directory extends BaseEntity {}
