export class SwitchItem extends HTMLElement {
	dataValue: number;
	class: string;
	length: number;
	inputEventEnabled: boolean;

	constructor() {
		super();

		const length = Math.clamp(parseInt(this.getAttribute('length') ?? ''), 1, 4);

		this.dataValue = 0;
		this.class = '';
		this.length = length;
		this.inputEventEnabled = false;

		this.on('pointerdown', this.pointerdown);
	}

	read(): number {
		return this.dataValue;
	}

	write(value: number): void {
		this.dataValue = value;
		this.update();
	}

	update(): void {
		this.removeClass(this.class);
		this.addClass((this.class = SwitchItem.classes[this.dataValue]));
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				this.write((this.dataValue + 1) % this.length);
				if (this.inputEventEnabled) {
					const input = new Event('input');
					input.value = this.dataValue;
					this.dispatchEvent(input);
				}
				break;
			}
		}
	}

	static classes = ['zero', 'one', 'two', 'three'];
}

customElements.define('switch-item', SwitchItem);
