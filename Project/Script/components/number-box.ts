import { NumberHistory } from './number-history.ts';
import { measureText } from '@/util/dom.ts';

export class NumberBox extends HTMLElement {
	input: HTMLInputElement;
	decimals: number;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;

	constructor(dom?: any) {
		super();

		dom = dom ?? this;
		const min = dom.getAttribute('min') ?? '0';
		const max = dom.getAttribute('max') ?? '0';
		const step = dom.getAttribute('step') ?? '1';
		const unit = dom.getAttribute('unit');
		const decimals = parseInt(dom.getAttribute('decimals')) || 0;

		const input = document.createElement('input');
		input.addClass('number-box-input');
		input.type = 'number';
		input.min = min;
		input.max = max;
		input.step = step;
		input.title = '';
		input.history = new NumberHistory(input);
		input.on('keydown', this.inputKeydown);
		input.on('change', this.inputChange);
		this.appendChild(input);

		if (this.childNodes.length > 1) {
			const label = this.childNodes[0].textContent;
			const font = 'var(--font-family-mono)';
			const padding = measureText(label, font).width + 8;
			input.style.paddingLeft = `${padding}px`;
		}

		if (unit !== null) {
			const unitText = document.createElement('text');
			const font = 'var(--font-family-mono)';
			const padding = measureText(unit, font).width + 8;
			unitText.addClass('unit');
			unitText.textContent = unit;
			this.insertBefore(unitText, input);
			input.style.paddingRight = `${padding}px`;
		}

		this.input = input;
		this.decimals = decimals;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;
	}

	read(): number {
		const min = parseFloat(this.input.min);
		const max = parseFloat(this.input.max);
		let value = parseFloat(this.input.value) || 0;
		value = Math.clamp(value, min, max);
		value = Math.roundTo(value, this.decimals);
		return value;
	}

	write(value: any): void {
		const { input } = this;
		input.value = String(value);
		input.value = String(this.read());
		input.history.reset();
	}

	enable() {
		if (this.removeClass('disabled')) {
			this.showChildNodes();
		}
	}

	disable() {
		if (this.addClass('disabled')) {
			this.hideChildNodes();
		}
	}

	getFocus(mode: any) {
		return this.input.getFocus(mode);
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'focus':
				if (!this.focusEventEnabled) {
					this.focusEventEnabled = true;
					this.input.on('focus', (event) => {
						this.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!this.blurEventEnabled) {
					this.blurEventEnabled = true;
					this.input.on('blur', (event) => {
						this.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	}

	inputKeydown(event: any) {
		!NumberBox.whiteList.includes(event.code) && !event.cmdOrCtrlKey && event.preventDefault();
	}

	inputChange(event: any) {
		this.value = this.parentNode.read();
	}

	static whiteList = [
		'Digit0',
		'Digit1',
		'Digit2',
		'Digit3',
		'Digit4',
		'Digit5',
		'Digit6',
		'Digit7',
		'Digit8',
		'Digit9',
		'Minus',
		'Period',
		'Numpad0',
		'Numpad1',
		'Numpad2',
		'Numpad3',
		'Numpad4',
		'Numpad5',
		'Numpad6',
		'Numpad7',
		'Numpad8',
		'Numpad9',
		'NumpadSubtract',
		'NumpadDecimal',
		'Backspace',
		'Delete',
		'Tab',
		'Enter',
		'ArrowLeft',
		'ArrowUp',
		'ArrowRight',
		'ArrowDown',
		'Home',
		'End',
		'NumpadEnter'
	];
}

customElements.define('number-box', NumberBox);
