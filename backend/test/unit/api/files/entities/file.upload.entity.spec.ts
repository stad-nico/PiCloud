import { File } from 'src/api/files/entities/file.entity';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';

describe('FileUploadEntity', () => {
	// to access private constructor
	const fileUploadEntity = new (FileUploadEntity as any)('fullPath', 'name', 'path', 'mimeType', 0, 'buffer') as FileUploadEntity;

	it('should return new File', () => {
		const file: File = fileUploadEntity.toFile();

		expect(file).toStrictEqual(new File('fullPath', 'name', 'path', 'mimeType', 0));
	});
});
