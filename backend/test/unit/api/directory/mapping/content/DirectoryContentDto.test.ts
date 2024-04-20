import { DirectoryContentDto } from 'src/api/directory/mapping/content';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('DirectoryContentDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid directory path`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryContentDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryContentDto.from(params);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		expect(DirectoryContentDto.from(params)).toStrictEqual(expectedDto);
	});
});
