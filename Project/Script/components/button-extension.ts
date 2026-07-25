HTMLButtonElement.prototype.enable = function (this: HTMLButtonElement): void {
	if (this.disabled) {
		this.disabled = false;
	}
};

HTMLButtonElement.prototype.disable = function (this: HTMLButtonElement): void {
	if (!this.disabled) {
		this.disabled = true;
	}
};
