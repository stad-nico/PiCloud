import { DirectoryCreateParams } from 'src/modules/directories/mapping/create';

describe('DirectoryCreateParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryCreateParams as any)('path')).toBeInstanceOf(DirectoryCreateParams);
	});
});
