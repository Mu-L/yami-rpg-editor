export class KeyboardBox extends HTMLElement {
	input: HTMLInputElement;
	dataValue: number;
	inputEventEnabled: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;

	constructor() {
		super();

		const input = document.createElement('input');
		input.addClass('keyboard-box-input');
		input.type = 'text';
		input.on('keydown', this.inputKeydown);
		this.appendChild(input);

		this.input = input;
		this.dataValue = 0;
		this.inputEventEnabled = false;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;
	}

	read(): number {
		return this.dataValue;
	}

	write(code: number): void {
		this.dataValue = code;
		this.input.value = String(code);
	}

	inputCode(code: number): void {
		if (this.dataValue !== code) {
			this.write(code);
			if (this.inputEventEnabled) {
				const input = new InputEvent('input') as InputEvent & {
					value: number;
				};
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			this.dispatchChangeEvent();
		}
	}

	enable(): void {
		if (this.removeClass('disabled')) {
			this.showChildNodes();
		}
	}

	disable(): void {
		if (this.addClass('disabled')) {
			this.hideChildNodes();
		}
	}

	getFocus(mode: string): HTMLInputElement {
		return this.input.getFocus(mode);
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
			case 'focus':
				if (!this.focusEventEnabled) {
					this.focusEventEnabled = true;
					this.input.on('focus', () => {
						this.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!this.blurEventEnabled) {
					this.blurEventEnabled = true;
					this.input.on('blur', () => {
						this.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	}

	inputKeydown(event: KeyboardEvent): void {
		event.stopPropagation();
		event.preventDefault();
		switch (event.code) {
			case 'Backspace':
				(this.parentNode as KeyboardBox).inputCode(0);
				break;
			case 'Enter':
			case 'NumpadEnter':
				event.stopImmediatePropagation();
			default:
				(this.parentNode as KeyboardBox).inputCode(parseInt(event.code) || 0);
				break;
		}
	}
}

customElements.define('keyboard-box', KeyboardBox);
