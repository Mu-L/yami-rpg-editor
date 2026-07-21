import { Variable } from './variable.ts';
import { GUID } from '../file/guid.ts';

// 创建ID
Variable.createId = function () {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.idMap[id]);
	return id;
};

// 注册变量
Variable.register = function (item) {
	if (item.class === 'folder') {
		for (const child of item.children) {
			Variable.register(child);
		}
	} else {
		Variable.idMap[item.id] = true;
	}
};

// 取消注册变量
Variable.unregister = function (item) {
	if (item.class === 'folder') {
		for (const child of item.children) {
			Variable.unregister(child);
		}
	} else {
		delete Variable.idMap[item.id];
	}
};

// 获取ID匹配的变量
Variable.getVariableById = (function IIFE() {
	const find = (items, id) => {
		const length = items.length;
		for (let i = 0; i < length; i++) {
			const item = items[i];
			if (item.class !== 'folder') {
				if (item.id === id) {
					return item;
				}
			} else {
				const result = find(item.children, id);
				if (result !== undefined) {
					return result;
				}
			}
		}
		return undefined;
	};
	return function (id) {
		return find(this.data, id);
	};
})();
