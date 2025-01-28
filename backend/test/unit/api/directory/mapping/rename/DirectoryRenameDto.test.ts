import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryPathException } from 'src/modules/directories/exceptions/InvalidDirectoryNameException';
import { PathUtils } from 'src/util/PathUtils';

describe('DirectoryRenameDto', () => {
	it('should throw an InvalidDirectoryPathException if the destination path is not valid', () => {
		const params = { path: 'test' };
		const body = { newPath: 'test/newPath/to/dir' };
		const expectedError = new InvalidDirectoryPathException(body.newPath);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should throw a DirectoryNameTooLongException if the destination path directory name is too long', () => {
		const dirname = new Array(PathUtils.MaxDirectoryNameLength + 1).fill('a').join('');
		const params = { path: 'test/newPath/to/dir' };
		const body = { newPath: 'path/' + dirname };
		const expectedError = new DirectoryNameTooLongException(dirname);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		expect(() => DirectoryRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir' };
		const body = { newPath: 'test/newPath/to/dir' };
		const expectedDto = DirectoryRenameDto.from(params, body);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		expect(DirectoryRenameDto.from(params, body)).toStrictEqual(expectedDto);
	});
});
