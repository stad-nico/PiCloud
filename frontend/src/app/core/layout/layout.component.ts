import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IconComponent } from '@pihub/components/icon';
import { pihub } from '@pihub/components/icons/regular';
import { folder, gear, house } from '@pihub/components/icons/solid';
import { SidebarComponent } from '@pihub/components/sidebar';

@Component({
	selector: 'layout',
	templateUrl: './layout.component.html',
	styleUrl: './layout.component.scss',
	imports: [RouterOutlet, SidebarComponent, IconComponent, RouterLink],
})
export default class LayoutComponent {
	protected readonly headerIcon = pihub;

	protected readonly sidebarEntries = [
		{ title: 'Dashboard', icon: house, route: '/test' },
		{ title: 'Explorer', icon: folder, route: '/explorer' },
		{ title: 'Settings', icon: gear, route: '/settings' },
	];
}
