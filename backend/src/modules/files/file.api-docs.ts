/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { applyDecorators } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { ParentDirectoryNotFoundException } from 'src/modules/directories/exceptions/ParentDirectoryNotFoundExceptions';
import { FileAlreadyExistsException } from 'src/modules/files/exceptions/FileAlreadyExistsException';
import { FileNameTooLongException } from 'src/modules/files/exceptions/FileNameTooLongException';
import { FileNotFoundException } from 'src/modules/files/exceptions/FileNotFoundException';
import { InvalidFileNameException } from 'src/modules/files/exceptions/InvalidFileNameException';
import { FileMetadataResponse } from 'src/modules/files/mapping/metadata';
import { FileUploadBody, FileUploadResponse } from 'src/modules/files/mapping/upload';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

export class FileApiDocs {
	public static controller() {
		return applyDecorators(ApiTags('files'), ApiBearerAuth());
	}

	public static upload() {
		return applyDecorators(
			ApiConsumes('multipart/form-data'),
			ApiBody({ description: 'File to upload', type: FileUploadBody }),
			ApiOperation({
				operationId: 'upload',
				summary: 'Upload file',
				description: 'Upload a file and store it under the provided parent id',
			}),
			ApiCreatedResponse({ type: FileUploadResponse, description: 'The file was created successfully' }),
			TemplatedApiException(
				() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'),
				{ description: 'The file name is too long' }
			),
			TemplatedApiException(() => new InvalidFileNameException('&/8892mf--+&.txt'), { description: 'The file path is not valid' }),
			TemplatedApiException(() => new ParentDirectoryNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
				description: 'The parent directory does not exist',
			}),
			TemplatedApiException(() => new FileAlreadyExistsException('example.txt'), { description: 'The file already exists' }),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static replace() {
		return applyDecorators(
			ApiOperation({
				operationId: 'replace',
				summary: 'Replace file',
				description: 'Upload a file and replace if it already exists',
			}),
			ApiCreatedResponse({ type: FileUploadResponse, description: 'The file was replaced successfully' }),
			TemplatedApiException(
				() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'),
				{ description: 'The file name is too long' }
			),
			TemplatedApiException(() => new InvalidFileNameException('+.-34/.'), { description: 'The file path is not valid' }),
			TemplatedApiException(() => new ParentDirectoryNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
				description: 'The parent directory does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static metadata() {
		return applyDecorators(
			ApiOperation({
				operationId: 'getFileMetadata',
				summary: 'Get file metadata',
				description: 'Get the metadata of a file with the given id',
			}),
			ApiOkResponse({ type: FileMetadataResponse, description: 'The metadata was retrieved successfully' }),
			TemplatedApiException(() => new FileNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
				description: 'The file does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static download() {
		return applyDecorators(
			ApiOperation({ operationId: 'downloadFile', summary: 'Download file', description: 'Download a file with the given id' }),
			ApiOkResponse({
				content: { '*/*': { schema: { type: 'string', format: 'binary' } } },
				description: 'The file was downloaded successfully',
			}),
			TemplatedApiException(() => new FileNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
				description: 'The file does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static rename() {
		return applyDecorators(
			ApiOperation({ operationId: 'renameFile', summary: 'Rename file', description: 'Rename the file with the given id' }),
			ApiNoContentResponse({ description: 'The file was renamed successfully' }),
			TemplatedApiException(
				() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'),
				{ description: 'The file name is too long' }
			),
			TemplatedApiException(() => new InvalidFileNameException('/$()§..fw'), { description: 'The file name is not valid' }),
			TemplatedApiException(() => new FileNotFoundException('853d4b18-8d1a-426c-b53e-74027ce1644b'), {
				description: 'The file does not exist',
			}),
			TemplatedApiException(() => new FileAlreadyExistsException('example.txt'), { description: 'The file already exists' }),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static delete() {
		return applyDecorators(
			ApiOperation({ operationId: 'deleteFile', summary: 'Delete file', description: 'Delete the file with the given id' }),
			ApiNoContentResponse({ description: 'The file was deleted successfully' }),
			TemplatedApiException(() => new FileNotFoundException('853d4b18-8d1a-426c-b53e-74027ce1644b'), {
				description: 'The file does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}
}
