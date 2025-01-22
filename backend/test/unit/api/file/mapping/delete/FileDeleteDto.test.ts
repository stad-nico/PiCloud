import { FileDeleteDto } from 'src/modules/files/mapping/delete';
import { PathUtils } from 'src/util/PathUtils';

describe('FileDeleteDto', () => {
	it('should return a dto with the normalized path', () => {
		jest.spyOn(PathUtils, 'isFilePathValid').mockReturnValue(true);

		const params = { path: 'test/path/to/dir.txt' };
		const expectedDto = FileDeleteDto.from(params);

		expect(FileDeleteDto.from(params)).toStrictEqual(expectedDto);
	});
});
