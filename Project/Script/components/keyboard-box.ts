// ******************************** 键盘按键框 ********************************

export class KeyboardBox extends HTMLElement {
	input: HTMLInputElement; //:element
	dataValue: number; //:number
	inputEventEnabled: boolean; //:boolean
	focusEventEnabled: boolean; //:boolean
	blurEventEnabled: boolean; //:boolean

	constructor() {
		super();

		// 创建输入框
		const input = document.createElement('input');
		input.addClass('keyboard-box-input');
		input.type = 'text';
		input.on('keydown', this.inputKeydown);
		this.appendChild(input);

		// 设置属性
		this.input = input;
		this.dataValue = 0;
		this.inputEventEnabled = false;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;
	}

	// 读取数据
	read(): number {
		return this.dataValue;
	}

	// 写入数据
	write(code: number): void {
		this.dataValue = code;
		this.input.value = String(code);
	}

	// 输入键值
	inputCode(code: number): void {
		if (this.dataValue !== code) {
			this.write(code);
			if (this.inputEventEnabled) {
				const input: any = new InputEvent('input');
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			this.dispatchChangeEvent();
		}
	}

	// 启用元素
	enable(): void {
		if (this.removeClass('disabled')) {
			this.showChildNodes();
		}
	}

	// 禁用元素
	disable(): void {
		if (this.addClass('disabled')) {
			this.hideChildNodes();
		}
	}

	// 获得焦点
	getFocus(mode: string): HTMLInputElement {
		return this.input.getFocus(mode);
	}

	// 添加事件
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
					this.input.on('focus', (event: Event) => {
						this.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!this.blurEventEnabled) {
					this.blurEventEnabled = true;
					this.input.on('blur', (event: Event) => {
						this.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	}

	// 输入框 - 键盘按下事件
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
				(this.parentNode as KeyboardBox).inputCode(
					parseInt(event.code) || 0
				);
				break;
		}
	}
}

customElements.define('keyboard-box', KeyboardBox);
