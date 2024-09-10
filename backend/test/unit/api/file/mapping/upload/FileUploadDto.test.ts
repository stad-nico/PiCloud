import { FileUploadDto } from 'src/api/file/mapping/upload';
import { FileNameTooLongException } from 'src/exceptions/FileNameTooLongException';
import { InvalidFilePathException } from 'src/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

describe('FileUploadDto', () => {
	it('should throw an InvalidFilePathException if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new InvalidFilePathException(params.path);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileUploadDto.from(params, 0 as any)).toThrow(expectedError);
	});

	it('should throw a FileNameTooLongException if the file name is too long', () => {
		const filename = new Array(PathUtils.MaxFileNameLength + 1).fill('a').join('');
		const params = { path: 'dir/' + filename };
		const expectedError = new FileNameTooLongException(filename);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(true);

		expect(() => FileUploadDto.from(params, 0 as any)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const file = { mimeType: 'text/plain', size: 19, stream: {} };
		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileUploadDto.from(params, file as any);

		expect(FileUploadDto.from(params, file as any)).toStrictEqual(expectedDto);
	});
});
