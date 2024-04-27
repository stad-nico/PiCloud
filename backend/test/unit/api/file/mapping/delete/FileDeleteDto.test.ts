import { FileDeleteDto } from 'src/api/file/mapping/delete';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('FileDeleteDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid file path`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileDeleteDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileDeleteDto.from(params);

		expect(FileDeleteDto.from(params)).toStrictEqual(expectedDto);
	});
});
