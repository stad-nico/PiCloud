import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata';
import { PathUtils } from 'src/util/PathUtils';

describe('DirectoryMetadataDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isDirectoryPathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir' };
		const expectedDto = DirectoryMetadataDto.from(params);

		expect(DirectoryMetadataDto.from(params)).toStrictEqual(expectedDto);
	});
});
