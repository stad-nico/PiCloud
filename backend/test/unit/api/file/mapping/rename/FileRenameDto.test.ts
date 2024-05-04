import { FileRenameDto } from 'src/api/file/mapping/rename';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

describe('FileRenameDto', () => {
	it('should throw a validation error if the source path is not valid', () => {
		const params = { path: 'test.txt' };
		const body = { newPath: 'test/newPath/to/dir.txt' };
		const expectedError = new ValidationError(`path ${params.path} is not a valid file path`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should throw a validation error if the destination path is not valid', () => {
		const params = { path: 'test.txt' };
		const body = { newPath: 'test/newPath/to/dir.txt' };
		const expectedError = new ValidationError(`path ${body.newPath} is not a valid file path`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(true);
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValueOnce(false);

		expect(() => FileRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should throw a validation error if the file name is too long', () => {
		const dirname = new Array(PathUtils.MaxFileNameLength + 1).fill('a').join('');
		const params = { path: 'test/newPath/to/dir.txt' };
		const body = { newPath: 'path/' + dirname };
		const expectedError = new ValidationError(`destination file name ${dirname} exceeds the file name limit of ${PathUtils.MaxFileNameLength} chars`);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		expect(() => FileRenameDto.from(params, body)).toThrow(expectedError);
	});

	it('should return a dto with the normalized path', () => {
		const params = { path: 'test/path/to/dir.txt' };
		const body = { newPath: 'path/new.txt' };
		const expectedDto = FileRenameDto.from(params, body);

		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		expect(FileRenameDto.from(params, body)).toStrictEqual(expectedDto);
	});
});
