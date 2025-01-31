/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DirectoryAlreadyExistsException } from 'src/modules/directories/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/DirectoryNameTooLongException';
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/DirectoryNotFoundException';
import { InvalidDirectoryNameException } from 'src/modules/directories/exceptions/InvalidDirectoryNameException';
import { RootCannotBeDeletedException } from 'src/modules/directories/exceptions/RootCannotBeDeletedException';
import { RootCannotBeRenamedException } from 'src/modules/directories/exceptions/RootCannotBeRenamed';
import { DirectoryContentResponse } from 'src/modules/directories/mapping/content/DirectoryContentResponse';
import { DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata/DirectoryMetadataResponse';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

export class DirectoryApiDocs {
	public static controller() {
		return applyDecorators(ApiTags('directories'), ApiBearerAuth());
	}

	public static create() {
		return applyDecorators(
			ApiOperation({
				operationId: 'create',
				summary: 'Create directory',
				description: 'Create a directory with the given name under the given parent id',
			}),
			ApiCreatedResponse({ description: 'The directory was created successfully' }),
			TemplatedApiException(
				() => new DirectoryNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName'),
				{ description: 'The directory name is too long' }
			),
			TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
				description: 'The directory does not exist',
			}),
			TemplatedApiException(() => new InvalidDirectoryNameException('%&/("§.*'), { description: 'The directory name is not valid' }),
			TemplatedApiException(() => new DirectoryAlreadyExistsException('example'), { description: 'The directory already exists' }),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static getRoot() {
		return applyDecorators(
			ApiOperation({
				operationId: 'getRoot',
				summary: 'Get root id',
				description: 'Get the id of the root directory for the current user',
			}),
			ApiOkResponse({ description: 'The root was retreived successfully' }),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static getContents() {
		return applyDecorators(
			ApiOperation({ operationId: 'getContents', summary: 'Get directory contents', description: 'Get the files and directories' }),
			ApiOkResponse({ type: DirectoryContentResponse, description: 'The contents were retrieved successfully' }),
			TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
				description: 'The directory does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static getMetadata() {
		return applyDecorators(
			ApiOperation({ operationId: 'getMetadata', summary: 'Get directory metadata', description: 'Get the metadata of a directory' }),
			ApiOkResponse({ type: DirectoryMetadataResponse, description: 'The metadata was retrieved successfully' }),
			TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
				description: 'The directory does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static download() {
		return applyDecorators(
			ApiOperation({
				operationId: 'download',
				summary: 'Download directory',
				description: 'Download the directory as a ZIP archive',
			}),
			ApiOkResponse({
				content: { '*/*': { schema: { type: 'string', format: 'binary' } } },
				description: 'The directory was downloaded successfully',
			}),
			TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
				description: 'The directory does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static rename() {
		return applyDecorators(
			ApiOperation({ operationId: 'rename', summary: 'Rename directory', description: 'Rename or move a directory' }),
			ApiNoContentResponse({ description: 'The directory was renamed successfully' }),
			TemplatedApiException(() => new InvalidDirectoryNameException('%26path&'), { description: 'The directory name is not valid' }),
			TemplatedApiException(
				() => new DirectoryNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName'),
				{ description: 'The directory name is too long' }
			),
			TemplatedApiException(() => RootCannotBeRenamedException, { description: 'The root directory cannot be renamed' }),
			TemplatedApiException(() => new DirectoryNotFoundException('9bb14df7-112b-486a-bd49-8261246ad256'), {
				description: 'The directory does not exist',
			}),
			TemplatedApiException(() => new DirectoryAlreadyExistsException('renamed'), {
				description: 'The destination directory already exists',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static delete() {
		return applyDecorators(
			ApiOperation({
				operationId: 'delete',
				summary: 'Delete directory',
				description: 'Delete the directory with the given id including all files and subdirectories',
			}),
			ApiNoContentResponse({ description: 'The directory was deleted successfully' }),
			TemplatedApiException(() => RootCannotBeDeletedException, { description: 'The root directory cannot be deleted' }),
			TemplatedApiException(() => new DirectoryNotFoundException('9bb14df7-112b-486a-bd49-8261246ad256'), {
				description: 'The directory does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}
}
