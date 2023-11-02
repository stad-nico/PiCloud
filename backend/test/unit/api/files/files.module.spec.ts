import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from 'src/api/files/files.controller';
import { FilesModule } from 'src/api/files/files.module';
import { FilesService } from 'src/api/files/files.service';
import { DataSource } from 'typeorm';

describe('FilesModule', () => {
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [FilesModule],
			providers: [
				{
					provide: DataSource,
					useValue: jest.fn(),
				},
			],
		}).compile();
	});

	it('FilesService should be defined', async () => {
		const filesService = module.get(FilesService);

		expect(filesService).toBeDefined();
		expect(filesService).toBeInstanceOf(FilesService);
	});

	it('FilesController should be defined', async () => {
		const filesController = module.get(FilesController);

		expect(filesController).toBeDefined();
		expect(filesController).toBeInstanceOf(FilesController);
	});

	it('ConfigService should be defined', async () => {
		const configService = module.get(ConfigService);

		expect(configService).toBeDefined();
		expect(configService).toBeInstanceOf(ConfigService);
	});

	it('ConfigService should be defined', async () => {
		const configService = module.get(TypeOrmModule);

		expect(configService).toBeDefined();
		expect(configService).toBeInstanceOf(TypeOrmModule);
	});
});
