import { TextHistory } from './text-history.ts';

export class TextBox extends HTMLElement {
	input: HTMLInputElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	// tree-list 等用于在 TextBox 实例上绑定重命名前的原文与被隐藏的子节点
	lastText: string;
	hiddenNodes: any[];
	declare closeButton: HTMLElement | null;

	constructor() {
		super();

		const input = document.createElement('input');
		input.addClass('text-box-input');
		input.type = 'text';
		input.history = new TextHistory(input);

		this.input = input;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;

		if (process.platform === 'darwin') {
			input.on('keydown', TextBox.macInputKeydown);
		}

		let isEditing = false;
		input.addEventListener('compositionstart', () => {
			isEditing = true;
		});
		input.addEventListener('compositionend', () => {
			isEditing = false;
		});
		input.addEventListener(
			'keydown',
			(e) => {
				if (!isEditing) {
					return;
				}
				switch (e.code) {
					case 'Escape':
					case 'Enter':
						e.stopPropagation();
						return;
				}
			},
			{ capture: true }
		);
	}

	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this.appendChild(this.input);
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

	focus(): void {
		super.focus();
		this.input.focus();
	}

	getFocus(mode: string | null): HTMLInputElement {
		return this.input.getFocus(mode);
	}

	setPlaceholder(placeholder: string): void {
		this.input.placeholder = placeholder;
	}

	setMaxLength(length: number): void {
		this.input.maxLength = length;
	}

	fitContent(): void {
		const parent = this.parentNode as HTMLElement;
		this.style.width = '0';
		this.style.width = `${Math.clamp(
			this.input.scrollWidth + 2,
			0,
			parent.rect().right - this.rect().left
		)}px`;
	}

	deleteInputContent(): void {
		if (this.read() !== '') {
			this.input.select();
			this.input.dispatchEvent(
				new InputEvent('beforeinput', {
					inputType: 'deleteContentForward',
					bubbles: true
				})
			);
			document.execCommand('delete');
		}
	}

	addCloseButton(): void {
		return TextBox.addCloseButton(this);
	}

	addKeydownFilter(): void {
		return TextBox.addKeydownFilter(this);
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

	static addCloseButton = (function IIFE() {
		const write = function (this: TextBox, value: string): void {
			TextBox.prototype.write.call(this, value);
			updateCloseButton(this);
		};
		const updateCloseButton = function (textBox: TextBox): void {
			return textBox.read() !== ''
				? (textBox.closeButton as HTMLElement).show()
				: (textBox.closeButton as HTMLElement).hide();
		};
		const keydown = function (this: TextBox, event: KeyboardEvent): void {
			switch (event.code) {
				case 'Escape':
					if (this.read() !== '') {
						event.stopPropagation();
						this.deleteInputContent();
					}
					break;
			}
		};
		const input = function (this: TextBox): void {
			updateCloseButton(this);
		};
		const closeButtonPointerdown = function (event: PointerEvent): void {
			event.preventDefault();
			event.stopPropagation();
		};
		const closeButtonClick = function (this: HTMLElement): void {
			(this.parentNode as TextBox).deleteInputContent();
		};
		return (textBox: TextBox): void => {
			textBox.write = write;
			textBox.on('keydown', keydown);
			textBox.on('input', input);
			textBox.closeButton = document.createElement('box');
			(textBox.closeButton as HTMLElement).addClass('close-button');
			(textBox.closeButton as HTMLElement).textContent = '\u2716';
			(textBox.closeButton as HTMLElement).on('pointerdown', closeButtonPointerdown);
			(textBox.closeButton as HTMLElement).on('click', closeButtonClick);
			textBox.appendChild((textBox.closeButton as HTMLElement).hide());
		};
	})();

	static addKeydownFilter = (function IIFE() {
		const keydown = function (event: KeyboardEvent): void {
			if (event.altKey) {
				return;
			} else if (!event.cmdOrCtrlKey && !event.shiftKey) {
				switch (event.code) {
					case 'Escape':
					case 'F1':
					case 'F3':
					case 'F4':
					case 'F9':
						return;
				}
			}
			event.stopImmediatePropagation();
		};
		return (textBox: TextBox): void => {
			textBox.on('keydown', keydown);
		};
	})();

	static macInputKeydown(event: KeyboardEvent): void {
		if (event.metaKey) {
			switch (event.code) {
				case 'KeyC':
					document.execCommand('copy');
					break;
				case 'KeyV':
					document.execCommand('paste');
					break;
				case 'KeyX':
					document.execCommand('cut');
					break;
			}
		}
	}
}

customElements.define('text-box', TextBox);
