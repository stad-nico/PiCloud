import { FileDownloadDto } from 'src/api/file/mapping/download';
import { PathUtils } from 'src/util/PathUtils';

describe('FileDownloadDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileDownloadDto.from(params);

		expect(FileDownloadDto.from(params)).toStrictEqual(expectedDto);
	});
});
