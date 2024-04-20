import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('DirectoryDeleteDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid directory path`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryDeleteDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryDeleteDto.from(params);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		expect(DirectoryDeleteDto.from(params)).toStrictEqual(expectedDto);
	});
});
