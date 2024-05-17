import { Component } from '@angular/core';
import { ContentListComponent } from 'src/components/app/explorer/content-list/ContentListComponent';
import { InteractivePathComponent } from 'src/components/app/explorer/interactive-path/InteractivePathComponent';
import { TreeViewComponent } from 'src/components/app/explorer/tree-view/TreeViewComponent';

@Component({
	selector: 'explorer',
	standalone: true,
	templateUrl: './ExplorerComponent.html',
	imports: [ContentListComponent, TreeViewComponent, InteractivePathComponent],
	styleUrl: './ExplorerComponent.css',
})
export class ExplorerComponent {}
