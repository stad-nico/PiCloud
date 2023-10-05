import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class DiskModule {
	public static forRoot(): DynamicModule {}
}
