import { ApiProperty } from '@nestjs/swagger';

export class FileUploadBody {
	@ApiProperty({ type: 'string', format: 'binary' })
	file: any;
}
