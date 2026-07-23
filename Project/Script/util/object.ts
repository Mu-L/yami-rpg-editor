// ******************************** 对象静态方法 ********************************

// 对象静态属性 - 空对象
Object.empty = {};

// 对象静态方法 - 克隆对象
// - 仅深拷贝「纯对象 / 数组」，其余（函数、类实例、DOM 节点等）原样引用
// - 通过 WeakMap 记录已访问对象，避免循环引用导致栈溢出
Object.clone = (function IIFE() {
	const { isArray } = Array;
	const isPlainObject = (value: any): boolean => {
		if (value === null || typeof value !== 'object') return false;
		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null;
	};
	const clone = <T>(object: T, seen: WeakMap<object, unknown>): T => {
		// 基础类型与非对象直接返回
		if (object === null || typeof object !== 'object') return object;
		// 命中循环引用：返回已克隆的副本，阻断递归
		if (seen.has(object as object)) {
			return seen.get(object as object) as T;
		}
		let copy: unknown[] | Record<PropertyKey, unknown>;
		if (isArray(object)) {
			const arr = object as unknown[];
			copy = new Array(arr.length);
			seen.set(object as object, copy);
			for (let i = 0; i < arr.length; i++) {
				const value = arr[i];
				(copy as unknown[])[i] = value instanceof Object ? clone(value, seen) : value;
			}
		} else if (isPlainObject(object)) {
			copy = {} as Record<PropertyKey, unknown>;
			seen.set(object as object, copy);
			for (const key in object as Record<string, unknown>) {
				const value = (object as Record<string, unknown>)[key];
				(copy as Record<string, unknown>)[key] =
					value instanceof Object ? clone(value, seen) : value;
			}
		} else {
			// 非纯对象（类实例、宿主对象等）：原样引用，避免触发其原型链上的 getter/setter 或循环
			return object;
		}
		return copy as T;
	};
	return function <T>(object: T): T {
		return clone(object, new WeakMap());
	};
})();
