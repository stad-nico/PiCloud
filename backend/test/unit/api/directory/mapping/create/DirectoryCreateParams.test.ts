import { DirectoryCreateParams } from 'src/api/directory/mapping/create';

describe('DirectoryCreateParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryCreateParams as any)('path')).toBeInstanceOf(DirectoryCreateParams);
	});
});
