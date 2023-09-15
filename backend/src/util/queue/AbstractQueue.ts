export abstract class AbstractQueue<T> {
	private items: T[];

	protected constructor() {
		this.items = [];
	}

	protected push(item: T): void {
		this.items.push(item);
	}

	protected pop(): T | undefined {
		return this.items.pop();
	}
}
