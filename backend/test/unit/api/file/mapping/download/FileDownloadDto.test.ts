import { FileDownloadDto } from 'src/api/file/mapping/download';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('FileDownloadDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid file path`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileDownloadDto.from(params)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileDownloadDto.from(params);

		expect(FileDownloadDto.from(params)).toStrictEqual(expectedDto);
	});
});
