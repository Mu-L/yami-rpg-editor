// ******************************** 元素实例列表 ********************************

export class UIInstanceList extends Array {
	// 设置属性（改名为 setProperty 避开基类 Array.set 协变契约）
	setProperty(key: string, value: any): void {
		const keys = key.split('-');
		const last = keys.length - 1;
		const property = keys[last];
		for (const element of this) {
			let node = element;
			for (let i = 0; i < last; i++) {
				node = node[keys[i]];
			}
			node[property] = value;
		}
	}

	// 调整大小
	resize(): void {
		for (const element of this) {
			element.resize();
		}
	}
}
