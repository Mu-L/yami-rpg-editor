export class CheckBox extends HTMLElement {
	dataValue = false;
	relations: HTMLElement[] = [];
	writeEventEnabled = false;
	inputEventEnabled = false;

	constructor(standard?: boolean) {
		super();

		this.dataValue = false;
		this.relations = [];
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;

		this.on('keydown', this.keydown);

		switch (standard ?? this.hasClass('standard')) {
			case true: {
				const mark = document.createElement('check-mark');
				this.tabIndex = 0;
				this.insertBefore(mark, this.childNodes[0]);
				this.on('click', this.mouseclick);
				break;
			}
			case false:
				this.on('pointerdown', this.pointerdown);
				break;
		}
	}

	read(): boolean {
		return this.dataValue;
	}

	write(value: boolean): void {
		this.dataValue = !!value;
		this.dataValue ? this.addClass('selected') : this.removeClass('selected');
		if (!this.hasClass('disabled')) {
			this.toggleRelatedElements();
		}
		if (this.writeEventEnabled) {
			const write = new Event('write');
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	input(value: boolean): void {
		if (this.dataValue !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input = new Event('input', {
					bubbles: true
				});
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			this.dispatchChangeEvent();
		}
	}

	enable(): void {
		if (this.removeClass('disabled')) {
			this.toggleRelatedElements();
		}
	}

	disable(): void {
		if (this.addClass('disabled')) {
			this.toggleRelatedElements();
		}
	}

	relate(elements: HTMLElement[]): void {
		this.relations = elements;
	}

	toggleRelatedElements(): void {
		if (!this.hasClass('disabled') && this.dataValue) {
			for (const element of this.relations) {
				element.enable();
			}
		} else {
			for (const element of this.relations) {
				element.disable();
			}
		}
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		HTMLElement.prototype.on.call(this as any, type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	keydown(event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey && !this.hasClass('disabled')) {
					event.stopPropagation();
					this.mouseclick(event);
				}
				break;
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (document.activeElement !== document.body) {
					document.activeElement.blur();
				}
				this.input(!this.read());
				break;
		}
	}

	mouseclick(event: Event): void {
		this.input(!this.read());
	}
}

customElements.define('check-box', CheckBox as any);
