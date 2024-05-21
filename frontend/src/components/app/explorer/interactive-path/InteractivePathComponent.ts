import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PathState } from 'src/components/app/actions/path';

@Component({
	selector: 'interactive-path',
	standalone: true,
	templateUrl: './InteractivePathComponent.html',
	styleUrl: './InteractivePathComponent.css',
})
export class InteractivePathComponent {
	private readonly router: Router;

	private readonly route: ActivatedRoute;

	@Select(PathState.path)
	path$!: Observable<string>;

	paths: string[] = [];

	constructor(route: ActivatedRoute, router: Router) {
		this.route = route;
		this.router = router;
	}

	ngOnInit() {
		this.path$.subscribe((path) => {
			this.paths = path.split('/');
		});
	}

	onClick(id: number) {
		this.router.navigate([this.paths.slice(0, id + 1).join('/')]);
	}
}
