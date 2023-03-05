import { Component } from "./Component.js";
import { DirectoryContentsCollection } from "./components/directoryContentsCollection/DirectoryContentsCollection.js";
import { DOMComponent } from "./components/DOM.js";
import { DirectoryContentElement } from "./components/directoryContentsCollection/DirectoryContentElement";
import { HTMLElementComponent } from "./../../../../out/src/client/common/ui/components/HTMLElementComponent";

export enum LayoutType {
	Floating,
}

export interface ComponentMap {
	DirectoryContentsCollection: DirectoryContentsCollection;
	DOMComponent: DOMComponent;
}

export function parseLayoutType(layoutType: LayoutType): any {
	return [];
}

// type LayoutMap = {
// 	[Key in LayoutType]: ComponentConfig[];
// };

// type ComponentConfig<T extends new (...args: any[]) => HTMLElementComponent = ComponentMap[keyof ComponentMap]> = {
// 	component: T;
// 	args: typeof this.component;
// };

export const Layouts = {
	[LayoutType.Floating]: [
		{
			component: DirectoryContentsCollection,
		},
	],
};

// function f<T extends keyof ComponentMap>(e: T): ComponentMap[T] {
// 	return new ComponentMap[e];
// }