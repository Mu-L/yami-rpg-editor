import './element-methods.js';

import { TextHistory } from './text-history.ts';
import { Timer } from '@/util/timer.ts';
import { TextBox } from './text-box.ts';

export class TextArea extends HTMLElement {
	input: HTMLElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;

	constructor() {
		super();

		const input = document.createElement('textarea');
		input.history = new TextHistory(input);
		input.on('keydown', this.inputKeydown);
		input.on('input', this.inputInput);
		input.listenDraggingScrollbarEvent();
		this.appendChild(input);

		this.input = input;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;

		if (process.platform === 'darwin') {
			input.on('keydown', TextBox.macInputKeydown);
		}
	}

	read(): string {
		return this.input.value;
	}

	write(value: string): void {
		this.input.value = value;
		this.input.history.reset();
	}

	insert(value: string): void {
		this.input.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: value,
				bubbles: true
			})
		);
		document.execCommand('insertText', false, value);
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

	inputKeydown(event: any) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
				}
				break;
		}
		if (!TextArea.target) {
			TextArea.target = this;
			TextArea.timer.add();
			this.addClass('inputting');
		}
	}

	inputInput() {
		if (!TextArea.target) {
			TextArea.target = this;
			TextArea.timer.add();
			this.addClass('inputting');
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

	static target = null;

	static timer = new Timer({
		duration: 0,
		callback: () => {
			TextArea.target.removeClass('inputting');
			TextArea.target = null;
		}
	});
}

customElements.define('text-area', TextArea);
