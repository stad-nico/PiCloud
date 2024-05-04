import { DirectoryRenameDto } from 'src/api/directory/mapping/rename';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('DirectoryRenameDto', () => {
	it('should throw a validation error if the source path is not valid', () => {
		const params = { path: 'test' };
		const body = { newPath: 'test/newPath/to/dir' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid directory path`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should throw a validation error if the destination path is not valid', () => {
		const params = { path: 'test' };
		const body = { newPath: 'test/newPath/to/dir' };
		const expectedError = new ValidationError(`path ${body.newPath} is not a valid directory path`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(true);
		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should throw a validation error if the destination path directory name is too long', () => {
		const dirname = new Array(PathUtils.MaxDirectoryNameLength + 1).fill('a').join('');
		const params = { path: 'test/newPath/to/dir' };
		const body = { newPath: 'path/' + dirname };
		const expectedError = new ValidationError(
			`destination directory name ${dirname} exceeds the directory name limit of ${PathUtils.MaxDirectoryNameLength} chars`
		);

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
