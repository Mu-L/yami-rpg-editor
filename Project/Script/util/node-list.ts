NodeList.prototype.on = function (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): NodeList {
	for (const element of this as unknown as Iterable<Node>) {
		(element as any).on(type, listener, options);
	}
	return this as unknown as NodeList;
};

NodeList.prototype.enable = function (): void {
	for (const element of this as unknown as Iterable<Node>) {
		(element as any).enable();
	}
};

NodeList.prototype.disable = function (): void {
	for (const element of this as unknown as Iterable<Node>) {
		(element as any).disable();
	}
};
