import { extension } from 'mime-types';
import { File } from 'src/api/files/entities/file.entity';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('recyclebin')
export class RecycledFile {
	@PrimaryColumn({ type: 'varchar', nullable: false })
	readonly uuid: string;

	@Column({ type: 'varchar', nullable: false })
	readonly origin: string;

	@Column({ type: 'varchar', nullable: false })
	readonly name: string;

	@Column({ type: 'varchar', nullable: false })
	readonly path: string;

	@Column({ type: 'varchar', nullable: false })
	readonly mimeType: string;

	@Column({ type: 'bigint', nullable: false })
	readonly size: number;

	@CreateDateColumn({ type: 'timestamp', nullable: false })
	readonly created!: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: false })
	readonly updated!: Date;

	constructor(uuid: string, origin: string, name: string, path: string, mimeType: string, size: number) {
		this.uuid = uuid;
		this.origin = origin;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
	}

	public static fromFile(file: File): RecycledFile {
		return new RecycledFile(uuid(), file.fullPath, file.name, file.path, file.mimeType, file.size);
	}

	public toFile(): File {
		return new File(this.origin, this.name, this.path, this.mimeType, this.size, this.uuid);
	}

	public getUuidAsDirPath(): string {
		return (
			this.uuid.match(/.{1,2}/g)!.reduce((acc, curr, ind) => (acc += ind === 1 || ind === 2 ? '/' + curr : curr)) +
			'.' +
			extension(this.mimeType)
		);
	}
}
