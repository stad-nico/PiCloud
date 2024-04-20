import { DirectoryCreateDto } from 'src/api/directory/mapping/create';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('DirectoryCreateDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid directory path`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryCreateDto.from(params)).toThrow(expectedError);
	});

	it('should throw a validation error if the directory name is too long', () => {
		const dirname = new Array(PathUtils.MaxDirectoryNameLength + 1).fill('a').join('');
		const params = { path: 'path/' + dirname };
		const expectedError = new ValidationError(`directory name ${dirname} exceeds the directory name limit of ${PathUtils.MaxDirectoryNameLength} chars`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(true);

		expect(() => DirectoryCreateDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryCreateDto.from(params);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		expect(DirectoryCreateDto.from(params)).toStrictEqual(expectedDto);
	});
});
