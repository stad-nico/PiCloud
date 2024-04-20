import { DirectoryDownloadDto } from 'src/api/directory/mapping/download';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('DirectoryDownloadDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid directory path`);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValueOnce(false);

		expect(() => DirectoryDownloadDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryDownloadDto.from(params);

		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		expect(DirectoryDownloadDto.from(params)).toStrictEqual(expectedDto);
	});
});
