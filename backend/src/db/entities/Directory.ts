import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('directories')
export class Directory {
	@PrimaryColumn({ type: 'varchar', nullable: false, default: () => 'UUID()', unique: true })
	readonly uuid!: string;

	@Column({ type: 'varchar', nullable: false })
	readonly name!: string;

	@ManyToOne(() => Directory, (directory) => directory.uuid, { onUpdate: 'RESTRICT', onDelete: 'RESTRICT', nullable: true })
	@JoinColumn({ name: 'parent' })
	readonly parent!: Directory | null;

	@Column({ type: 'tinyint', nullable: true, default: false })
	readonly isRecycled!: boolean;

	@Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP()' })
	readonly created!: Date;

	@Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP()', onUpdate: 'CURRENT_TIMESTAMP()' })
	readonly updated!: Date;
}

// export type Directory = {
// import { WhereKeys } from 'src/db/entities/Directory';
// 	uuid: string;
// 	name: string;
// 	parent: string;
// 	isRecycled: boolean;
// 	created: Date;
// 	updated: Date;
// };

// export type Directory2 = {
// 	uuid: {
// 		type: string;
// 		nullable: false;
// 		hasDefault: true;
// 	};
// 	name: {
// 		type: string;
// 		nullable: false;
// 		hasDefault: false;
// 	};
// 	parent: {
// 		type: string;
// 		nullable: true;
// 		hasDefault: true;
// 	};
// 	isRecycled: {
// 		type: boolean;
// 		nullable: false;
// 		hasDefault: true;
// 	};
// 	created: {
// 		type: Date;
// 		nullable: false;
// 		hasDefault: true;
// 	};
// 	updated: {
// 		type: Date;
// 		nullable: false;
// 		hasDefault: true;
// 	};
// };

// type Column = {
// 	type: string | boolean | Date;
// 	nullable: boolean;
// 	hasDefault: boolean;
// };

// export type BaseEntity = Record<string, Column>;

// type EntityTypes<E extends BaseEntity> = {
// 	[K in keyof E]: E[K]['nullable'] extends true ? E[K]['type'] | null : E[K]['type'];
// };

// type DirSelectOptions = { path: string; size: number; filesAmt: number; directoriesAmt: number };

// type DirWhereOptions = { path: string; size: number; filesAmt: number; directoriesAmt: number };

// export type SelectOptions<Entity extends BaseEntity> = BaseSelectOptions<Entity> & AdvancedSelectOptions<Entity>;

// type BaseSelectOptions<Entity extends BaseEntity> = EntityTypes<Entity>;

// type AdvancedSelectOptions<Entity extends BaseEntity> = Entity extends Directory2 ? DirSelectOptions : never;

// export type WhereOptions<Entity extends BaseEntity, WhereKey extends WhereKeys<Directory2>> = BaseWhereOptions<Entity> & AdvancedWhereOptions<Entity>;

// type BaseWhereOptions<Entity extends Partial<BaseEntity>> = EntityTypes<Entity>;

// type AdvancedWhereOptions<Entity extends BaseEntity> = Entity extends Directory2 ? Di rWhereOptions : never;

// export type WhereKeys<Entity extends BaseEntity> = keyof SelectOptions<Entity>;
// export type SelectKeys<Entity extends BaseEntity> = keyof WhereOptions<Entity>;

// // export type WhereOptions<E extends BaseEntity, T extends keyof SelectOptions2<E>> = NarrowedNullable2<E, T>;
// export type SelectOneResult = any;
// // export type SelectOneResult<E extends BaseEntity, T extends keyof SelectOptions2<E>> = NarrowedNullable2<E, T> | null;
// // export type SelectAllResult<E extends BaseEntity, T extends keyof SelectOptions2<E>> = Array<NarrowedNullable2<E, T>>;
// // export type SelectOptions<E extends BaseEntity, K extends keyof SelectOptions2<E>> = Array<K>;

// // export type UpdatePartial<E extends BaseEntity, T extends keyof Defaults<E>> = NarrowedNullable2<E,

// export type DirectorySelectOptions = Directory & {
// 	path: string;
// 	size: number;
// 	filesAmt: number;
// 	directoriesAmt: number;
// };

// // export type DirectoryNullables = 'parent';

// // export const DirectoryNullables = ['parent'];

// // export type DirectoryDefaults = 'uuid' | 'parent' | 'isRecycled' | 'created' | 'updated';

// // export type WhereKeys = keyof DirectorySelectOptions;

// // export type SelectKeys = keyof DirectorySelectOptions;

// // export type ValidEntity<T extends keyof DirectorySelectOptions> = NarrowedNullable<T>;

// // export type WhereOptions<T extends keyof DirectorySelectOptions> = NarrowedNullable<T>;

// // export type SelectOneResult<K extends keyof DirectorySelectOptions> = NarrowedNullable<K> | null;

// // export type SelectAllResult<K extends keyof DirectorySelectOptions> = Array<NarrowedNullable<K>>;

// // export type UpdatePartial<K extends keyof Directory> = NarrowedNullable<K>;

// // export type SelectOptions<K extends keyof DirectorySelectOptions> = Array<K>;

// // export type SoftDeleteWhereOptions<T extends keyof DirectorySelectOptions> = { root: string | null } & Partial<NarrowedNullable<T>>;

// // export type NarrowedNullable<T extends keyof DirectorySelectOptions> = {
// // 	[K in T]: K extends DirectoryNullables ? DirectorySelectOptions[K] | null : DirectorySelectOptions[K];
// // };

// // export type InsertPartial<T extends keyof Directory> = NarrowedNullable<Exclude<keyof Directory, DirectoryDefaults>> &
// // 	Partial<NarrowedNullable<T>>;
