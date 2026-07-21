// ******************************** 元素实例列表 ********************************

export class UIInstanceList extends Array {
	// 设置属性
	set(key, value) {
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
	resize() {
		for (const element of this) {
			element.resize();
		}
	}
}
