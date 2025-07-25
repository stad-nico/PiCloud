import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { DirectoryService } from 'generated';
import { firstValueFrom } from 'rxjs';
import { ExplorerService } from 'src/app/features/explorer/services/explorer.service';

@Injectable({ providedIn: 'root' })
export class RootRedirectGuard implements CanActivate {
	/**
	 * The service to get information about the directories.
	 */
	private readonly directoryService = inject(DirectoryService);

	/**
	 * The explorer service to get the last opened directory.
	 */
	private readonly explorerService = inject(ExplorerService);

	/**
	 * Angulars router to parse the url.
	 */
	private readonly router = inject(Router);

	/**
	 * Redirects from the base path `explorer` to the last opened directory.
	 * Otherwise it will redirect to the root directory `explorer/<ROUTE_ID>`.
	 *
	 * @param route current activated route snapshot
	 * @returns observable that emits the redirect URL tree
	 */
	public async canActivate(): Promise<UrlTree> {
		const directoryId = this.explorerService.directoryId() ?? (await firstValueFrom(this.directoryService.getRoot())).id;

		return this.router.parseUrl(`/explorer/${directoryId}`);
	}
}
