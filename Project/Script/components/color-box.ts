import { Color } from '@/tools/color-picker-window.ts';

export class ColorBox extends HTMLElement {
	dataValue: string;
	foreground: HTMLElement;
	inputEventEnabled: boolean;

	constructor() {
		super();

		const background = document.createElement('box');
		background.addClass('color-box-background');
		this.appendChild(background);

		const foreground = document.createElement('box');
		foreground.addClass('color-box-foreground');
		this.appendChild(foreground);

		this.tabIndex = 0;
		this.dataValue = '';
		this.foreground = foreground;
		this.inputEventEnabled = false;

		this.on('keydown', this.keydown);
		this.on('click', this.mouseclick);
	}

	read(): string {
		return this.dataValue;
	}

	write(color: string): void {
		this.dataValue = color;

		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		this.foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	input(color: string): void {
		if (this.dataValue !== color) {
			this.write(color);
			if (this.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: string;
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

	keydown(event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					this.mouseclick(event);
				}
				break;
		}
	}

	mouseclick(event: Event): void {
		Color.open(this);
	}
}

customElements.define('color-box', ColorBox);
