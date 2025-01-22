import { DirectoryCreateDto } from 'src/modules/directories/mapping/create';
import { DirectoryNameTooLongException } from 'src/shared/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryPathException } from 'src/shared/exceptions/InvalidDirectoryNameException';
import { PathUtils } from 'src/util/PathUtils';

describe('DirectoryCreateDto', () => {
	it('should throw an InvalidDirectoryPathException if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new InvalidDirectoryPathException(params.path);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryCreateDto.from(params)).toThrow(expectedError);
	});

	it('should throw a DirectoryNameTooLongException if the directory name is too long', () => {
		const dirname = new Array(PathUtils.MaxDirectoryNameLength + 1).fill('a').join('');
		const params = { path: 'path/' + dirname };
		const expectedError = new DirectoryNameTooLongException(dirname);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(true);

		expect(() => DirectoryCreateDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryCreateDto.from(params);

		expect(DirectoryCreateDto.from(params)).toStrictEqual(expectedDto);
	});
});
