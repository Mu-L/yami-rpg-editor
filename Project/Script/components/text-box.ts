import { TextHistory } from './text-history.ts';

// ******************************** 文本框 ********************************

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

		// 创建输入框
		const input = document.createElement('input');
		input.addClass('text-box-input');
		input.type = 'text';
		input.history = new TextHistory(input);

		// 设置属性
		this.input = input;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;

		// 添加事件侦听器 - Mac
		if (process.platform === 'darwin') {
			input.on('keydown', TextBox.macInputKeydown);
		}

		// 添加合成事件
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

	// 自定义元素升级后（已连入文档）才允许操作子节点
	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this.appendChild(this.input);
	}

	// 读取数据
	read(): string {
		return this.input.value;
	}

	// 写入数据
	write(value: string): void {
		this.input.value = value;
		this.input.history.reset();
	}

	// 插入数据
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

	// 设置焦点
	focus(): void {
		super.focus();
		this.input.focus();
	}

	// 获得焦点
	getFocus(mode: string | null): HTMLInputElement {
		return this.input.getFocus(mode);
	}

	// 设置占位符
	setPlaceholder(placeholder: string): void {
		this.input.placeholder = placeholder;
	}

	// 设置最大长度
	setMaxLength(length: number): void {
		this.input.maxLength = length;
	}

	// 调整输入框大小来适应内容
	fitContent(): void {
		const parent = this.parentNode as HTMLElement;
		this.style.width = '0';
		this.style.width = `${Math.clamp(
			this.input.scrollWidth + 2,
			0,
			parent.rect().right - this.rect().left
		)}px`;
	}

	// 删除输入框内容
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

	// 添加关闭按钮
	addCloseButton(): void {
		return TextBox.addCloseButton(this);
	}

	// 添加键盘按下过滤器
	addKeydownFilter(): void {
		return TextBox.addKeydownFilter(this);
	}

	// 添加事件
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

	// 静态 - 添加关闭按钮
	static addCloseButton = (function IIFE() {
		// 重写写入方法
		const write = function (this: TextBox, value: string): void {
			TextBox.prototype.write.call(this, value);
			updateCloseButton(this);
		};
		// 更新关闭按钮
		const updateCloseButton = function (textBox: TextBox): void {
			return textBox.read() !== ''
				? (textBox.closeButton as HTMLElement).show()
				: (textBox.closeButton as HTMLElement).hide();
		};
		// 键盘按下事件
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
		// 输入事件
		const input = function (this: TextBox, event: Event): void {
			updateCloseButton(this);
		};
		// 关闭按钮 - 鼠标按下事件
		const closeButtonPointerdown = function (event: PointerEvent): void {
			// 阻止默认的失去焦点行为并停止传递事件
			event.preventDefault();
			event.stopPropagation();
		};
		// 关闭按钮 - 鼠标点击事件
		const closeButtonClick = function (
			this: HTMLElement,
			event: Event
		): void {
			(this.parentNode as TextBox).deleteInputContent();
		};
		return (textBox: TextBox): void => {
			textBox.write = write;
			textBox.on('keydown', keydown);
			textBox.on('input', input);
			textBox.closeButton = document.createElement('box');
			(textBox.closeButton as HTMLElement).addClass('close-button');
			(textBox.closeButton as HTMLElement).textContent = '\u2716';
			(textBox.closeButton as HTMLElement).on(
				'pointerdown',
				closeButtonPointerdown
			);
			(textBox.closeButton as HTMLElement).on('click', closeButtonClick);
			textBox.appendChild((textBox.closeButton as HTMLElement).hide());
		};
	})();

	// 静态 - 添加键盘按下过滤器
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

	// 静态 - 输入框键盘按下事件
	// Mac版不存在默认的复制/粘贴/剪切操作
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
