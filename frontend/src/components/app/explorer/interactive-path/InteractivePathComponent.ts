import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'interactive-path',
	standalone: true,
	templateUrl: './InteractivePathComponent.html',
})
export class InteractivePathComponent {
	private readonly router: Router;

	private readonly route: ActivatedRoute;

	paths: string[] = [];

	constructor(route: ActivatedRoute, router: Router) {
		this.route = route;
		this.router = router;
	}

	ngOnInit() {
		this.route.url.subscribe((segments) => {
			this.paths = segments.map((x) => x.path);
			console.log(this.paths);
		});
	}

	onClick(id: number) {
		this.router.navigate([this.paths.slice(0, id + 1).join('/')]);
	}
}
