import { Component, HostListener, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
	selector: 'content-list-directory',
	standalone: true,
	templateUrl: './ContentListDirectoryComponent.html',
	styleUrl: './ContentListDirectoryComponent.css',
	imports: [RouterModule],
})
export class ContentListDirectoryComponent {
	private readonly router: Router;

	private readonly route: ActivatedRoute;

	@Input({ required: true })
	name!: string;

	@Input({ required: true })
	size!: number;

	constructor(router: Router, route: ActivatedRoute) {
		this.router = router;
		this.route = route;
	}

	@HostListener('dblclick')
	onClick() {
		this.router.navigate([this.name], { relativeTo: this.route });
	}

	formatBytes(bytes: number, decimals: number = 2): string {
		if (!+bytes) return '0 B';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
}
