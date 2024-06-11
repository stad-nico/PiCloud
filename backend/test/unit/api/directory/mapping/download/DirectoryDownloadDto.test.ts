import { DirectoryDownloadDto } from 'src/api/directory/mapping/download';
import { PathUtils } from 'src/util/PathUtils';

describe('DirectoryDownloadDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryDownloadDto.from(params);

		expect(DirectoryDownloadDto.from(params)).toStrictEqual(expectedDto);
	});
});
