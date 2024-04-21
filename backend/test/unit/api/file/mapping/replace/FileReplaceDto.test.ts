import { FileReplaceDto } from 'src/api/file/mapping/replace';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('FileReplaceDto', () => {
	it('should throw a validation error if the path is not valid', () => {
		const params = { path: 'test' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid file path`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileReplaceDto.from(params, 0 as any)).toThrow(expectedError);
	});

	it('should throw a validation error if the file name is too long', () => {
		const filename = new Array(PathUtils.MaxFileNameLength + 1).fill('a').join('');
		const params = { path: 'dir/' + filename };
		const expectedError = new ValidationError(`file name ${filename} exceeds the file name limit of ${PathUtils.MaxFileNameLength} chars`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(true);

		expect(() => FileReplaceDto.from(params, 0 as any)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const file = { mimeType: 'text/plain', size: 19, stream: {} };
		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileReplaceDto.from(params, file as any);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		expect(FileReplaceDto.from(params, file as any)).toStrictEqual(expectedDto);
	});
});
