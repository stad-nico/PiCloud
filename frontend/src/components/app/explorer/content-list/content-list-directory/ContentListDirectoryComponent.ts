import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
	selector: 'content-list-directory',
	standalone: true,
	templateUrl: './ContentListDirectoryComponent.html',
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

	onClick() {
		this.router.navigate([this.name], { relativeTo: this.route });
	}
}
