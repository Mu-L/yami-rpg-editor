// ******************************** 数组静态方法 ********************************

// 数组静态属性 - 空数组
Array.empty = [];

// 数组静态方法 - 减法
Array.subtract = function <T>(a: T[], b: T[]): T[] {
	const differences: T[] = [];
	const length = a.length;
	for (let i = 0; i < length; i++) {
		if (b.indexOf(a[i]) === -1) {
			differences.push(a[i]);
		}
	}
	return differences;
};

// ******************************** 数组方法 ********************************

// 数组方法 - 添加
Object.defineProperty(Array.prototype, 'append', {
	enumerable: false,
	value: function (this: any[], value: any): boolean {
		if (this.indexOf(value) === -1) {
			this.push(value);
			return true;
		}
		return false;
	}
});

// 数组方法 - 移除
Object.defineProperty(Array.prototype, 'remove', {
	enumerable: false,
	value: function (this: any[], value: any): boolean {
		const index = this.indexOf(value);
		if (index !== -1) {
			this.splice(index, 1);
			return true;
		}
		return false;
	}
});

// 数组方法 - 设置
Object.defineProperty(Array.prototype, 'set', {
	enumerable: false,
	value: function (this: any[], array: any[]): void {
		const length = Math.min(this.length, array.length);
		for (let i = 0; i < length; i++) {
			this[i] = array[i];
		}
	}
});
