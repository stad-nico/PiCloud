import { FileReplaceDto } from 'src/modules/files/mapping/replace';
import { FileNameTooLongException } from 'src/modules/files/exceptions/FileNameTooLongException';
import { InvalidFilePathException } from 'src/modules/files/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

describe('FileReplaceDto', () => {
	it('should throw an InvalidFilePathException if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new InvalidFilePathException(params.path);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileReplaceDto.from(params, 0 as any)).toThrow(expectedError);
	});

	it('should throw a FileNameTooLongException if the file name is too long', () => {
		const filename = new Array(PathUtils.MaxFileNameLength + 1).fill('a').join('');
		const params = { path: 'dir/' + filename };
		const expectedError = new FileNameTooLongException(filename);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(true);

		expect(() => FileReplaceDto.from(params, 0 as any)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const file = { mimeType: 'text/plain', size: 19, stream: {} };
		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileReplaceDto.from(params, file as any);

		expect(FileReplaceDto.from(params, file as any)).toStrictEqual(expectedDto);
	});
});
