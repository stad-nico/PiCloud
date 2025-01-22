import { DirectoryContentDto } from 'src/modules/directories/mapping/content';
import { PathUtils } from 'src/util/PathUtils';

describe('DirectoryContentDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryContentDto.from(params);

		expect(DirectoryContentDto.from(params)).toStrictEqual(expectedDto);
	});
});
