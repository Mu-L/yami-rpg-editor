import { RadioProxy } from './radio-proxy.ts';

export class RadioBox extends HTMLElement {
	proxy: RadioProxy;
	dataValue: number | string | boolean;

	constructor() {
		super();

		let proxy = RadioProxy.map[this.name];
		if (proxy === undefined) {
			proxy = document.createElement('radio-proxy') as RadioProxy;
			proxy.id = this.name;
			proxy.style.display = 'none';
			this.appendChild(proxy);
			RadioProxy.map[proxy.id] = proxy;
		}

		const string = this.getAttribute('value') ?? '';
		const isNumber = RegExp.number.test(string);
		const value = isNumber
			? parseFloat(string)
			: string === 'false'
				? false
				: string === 'true'
					? true
					: string;

		this.proxy = proxy;
		this.dataValue = value;

		this.on('keydown', this.keydown);

		switch (this.hasClass('standard')) {
			case true: {
				const mark = document.createElement('radio-mark');
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

	keydown(event: KeyboardEvent): void {
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
				if (!this.hasClass('selected')) {
					if (document.activeElement !== document.body) {
						document.activeElement.blur();
					}
					this.proxy.input(this.dataValue);
				} else if (this.proxy.cancelable) {
					if (document.activeElement !== document.body) {
						document.activeElement.blur();
					}
					this.proxy.reset();
				}
				break;
		}
	}

	mouseclick(): void {
		if (!this.hasClass('selected')) {
			this.proxy.input(this.dataValue);
		} else if (this.proxy.cancelable) {
			this.proxy.reset();
		}
	}
}

customElements.define('radio-box', RadioBox);
