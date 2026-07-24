// ******************************** 节点列表方法 ********************************

// 节点列表 - 添加事件
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

// 节点列表 - 启用元素
NodeList.prototype.enable = function (): void {
	for (const element of this as unknown as Iterable<Node>) {
		(element as any).enable();
	}
};

// 节点列表 - 禁用元素
NodeList.prototype.disable = function (): void {
	for (const element of this as unknown as Iterable<Node>) {
		(element as any).disable();
	}
};
