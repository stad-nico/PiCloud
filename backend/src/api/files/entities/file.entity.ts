import { extension } from 'mime-types';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as generateUUID } from 'uuid';

@Entity('files')
export class File {
	@PrimaryColumn('uuid', { unique: true })
	readonly uuid: string;

	@Column({ type: 'varchar', nullable: false })
	readonly fullPath: string;

	@Column({ type: 'varchar', nullable: false })
	readonly name: string;

	@Column({ type: 'varchar', nullable: false })
	readonly path: string;

	@Column({ type: 'varchar', nullable: false })
	readonly mimeType: string;

	@Column({ type: 'bigint', nullable: false })
	readonly size: number;

	@Column({ type: 'boolean', nullable: false })
	readonly isRecycled: boolean;

	@CreateDateColumn({ type: 'timestamp', nullable: false })
	readonly created!: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: false })
	readonly updated!: Date;

	constructor(
		fullPath: string,
		name: string,
		path: string,
		mimeType: string,
		size: number,
		isRecycled: boolean = false,
		uuid: string = generateUUID()
	) {
		this.uuid = uuid;
		this.fullPath = fullPath;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
		this.isRecycled = isRecycled;
	}

	public getUuidAsDirPath(): string {
		return (
			this.uuid.match(/.{1,2}/g)!.reduce((acc, curr, ind) => (acc += ind === 1 || ind === 2 ? '/' + curr : curr)) +
			'.' +
			extension(this.mimeType)
		);
	}
}
