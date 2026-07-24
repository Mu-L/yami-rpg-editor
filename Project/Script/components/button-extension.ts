// ******************************** 按钮扩展 ********************************

// 启用元素
HTMLButtonElement.prototype.enable = function (this: HTMLButtonElement): void {
	if (this.disabled) {
		this.disabled = false;
	}
};

// 禁用元素
HTMLButtonElement.prototype.disable = function (this: HTMLButtonElement): void {
	if (!this.disabled) {
		this.disabled = true;
	}
};
