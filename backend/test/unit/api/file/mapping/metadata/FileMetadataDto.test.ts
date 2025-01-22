import { FileMetadataDto } from 'src/modules/files/mapping/metadata';
import { PathUtils } from 'src/util/PathUtils';

describe('FileMetadataDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileMetadataDto.from(params);

		expect(FileMetadataDto.from(params)).toStrictEqual(expectedDto);
	});
});
