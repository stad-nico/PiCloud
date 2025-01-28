import { FileRenameDto } from 'src/modules/files/mapping/rename';
import { FileNameTooLongException } from 'src/modules/files/exceptions/FileNameTooLongException';
import { InvalidFilePathException } from 'src/modules/files/exceptions/InvalidFileNameException';
import { PathUtils } from 'src/util/PathUtils';

describe('FileRenameDto', () => {
	it('should throw an InvalidFilePathException if the destination path is not valid', () => {
		const params = { path: 'test.txt' };
		const body = { newPath: 'test/newPath/to/dir.txt' };
		const expectedError = new InvalidFilePathException(body.newPath);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should throw FileNameTooLongException if the destination file name is too long', () => {
		const dirname = new Array(PathUtils.MaxFileNameLength + 1).fill('a').join('');
		const params = { path: 'test/newPath/to/dir.txt' };
		const body = { newPath: 'path/' + dirname };
		const expectedError = new FileNameTooLongException(dirname);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		expect(() => FileRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir.txt' };
		const body = { newPath: 'path/new.txt' };
		const expectedDto = FileRenameDto.from(params, body);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		expect(FileRenameDto.from(params, body)).toStrictEqual(expectedDto);
	});
});
