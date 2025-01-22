import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete';
import { PathUtils } from 'src/util/PathUtils';

describe('DirectoryDeleteDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryDeleteDto.from(params);

		expect(DirectoryDeleteDto.from(params)).toStrictEqual(expectedDto);
	});
});
