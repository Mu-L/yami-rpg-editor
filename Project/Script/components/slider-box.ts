import { NumberBox } from './number-box.ts';

export class SliderBox extends HTMLElement {
	filler: HTMLElement;
	input: HTMLInputElement;
	synchronizer: HTMLElement & { value: any; [k: string]: any };
	bar: HTMLElement & { [k: string]: any };
	step: number;
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;

	constructor() {
		super();

		const bar = document.createElement('slider-bar');

		const filler = document.createElement('slider-filler');
		bar.appendChild(filler);

		const input = document.createElement('input');
		input.addClass('slider-input');
		input.type = 'range';
		input.tabIndex = -1;
		input.on('wheel', this.inputWheel);

		this.bar = bar;
		this.filler = filler;
		this.input = input;
		this.synchronizer = null;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;

		this.on('input', this.sliderInput);
	}

	// 自定义元素升级后（已连入文档）才允许读取属性/操作子节点
	connectedCallback() {
		if (this._built) return;
		this._built = true;
		const min = this.getAttribute('min') ?? '0';
		const max = this.getAttribute('max') ?? '0';
		const step = this.getAttribute('step') ?? '1';
		this.input.min = min;
		this.input.max = max;
		this.input.step = step;
		this.activeWheel = this.hasAttribute('active-wheel');
		this.appendChild(this.bar);
		this.appendChild(this.input);
	}

	read() {
		return parseFloat(this.input.value);
	}

	write(value: any) {
		this.input.value = value;
		this.updateFiller();
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

	updateFiller() {
		const filler = this.filler;
		const value = this.read();
		if (filler.value !== value) {
			filler.value = value;
			const input = this.input;
			const min = parseFloat(input.min);
			const max = parseFloat(input.max);
			if (min !== max) {
				const p = Math.roundTo(((value - min) * 100) / (max - min), 6);
				filler.style.width = `${p}%`;
			}
		}
	}

	synchronize(target: any) {
		const slider = this;
		const number = target;
		if (slider.synchronizer) {
			return;
		}

		if (number instanceof NumberBox) {
			const writeSlider = slider.write;
			const writeNumber = number.write;

			const sliderPointerdown = () => {
				slider.input.focus();
			};

			const sliderInput = (event?) => {
				writeNumber.call(number, slider.read());
				event && number.dispatchEvent(new Event('input'));
			};

			const numberInput = (event?) => {
				writeSlider.call(slider, number.read());
				event && slider.dispatchEvent(new Event('input'));
			};

			slider.synchronizer = target;

			slider.input.on('pointerdown', sliderPointerdown);
			slider.input.on('input', sliderInput);
			number.input.on('input', numberInput);

			slider.write = (value) => {
				writeSlider.call(slider, value);
				sliderInput();
			};

			number.write = (value) => {
				writeNumber.call(number, value);
				numberInput();
			};
		}
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

	sliderInput(event: any) {
		this.updateFiller();
	}

	inputWheel(event: any) {
		if (event.deltaY === 0) return;
		if (this.parentNode.activeWheel) {
			event.preventDefault();
			const input = this;
			const last = input.value;
			input.value = String(
				Math.roundTo(parseFloat(input.value) + input.step * (event.deltaY > 0 ? -1 : 1), 2)
			);
			if (input.value !== last) {
				input.dispatchEvent(
					new Event('input', {
						bubbles: true
					})
				);
			}
		}
	}
}

customElements.define('slider-box', SliderBox);
