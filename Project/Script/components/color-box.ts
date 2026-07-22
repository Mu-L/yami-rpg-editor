import { Color } from '../tools/color-picker-window.ts';

// ******************************** 颜色框 ********************************

export class ColorBox extends HTMLElement {
	dataValue: string; //:string
	foreground: HTMLElement; //:element
	inputEventEnabled: boolean; //:boolean

	constructor() {
		super();

		// 创建背景区域
		const background = document.createElement('box');
		background.addClass('color-box-background');
		this.appendChild(background);

		// 创建前景区域
		const foreground = document.createElement('box');
		foreground.addClass('color-box-foreground');
		this.appendChild(foreground);

		// 设置属性
		this.tabIndex = 0;
		this.dataValue = '';
		this.foreground = foreground;
		this.inputEventEnabled = false;

		// 侦听事件
		this.on('keydown', this.keydown);
		this.on('click', this.mouseclick);
	}

	// 读取数据
	read(): string {
		return this.dataValue;
	}

	// 写入数据
	write(color: string): void {
		this.dataValue = color;

		// 更新样式
		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		this.foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	// 输入数据
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
		}
	}

	// 键盘按下事件
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

	// 鼠标点击事件
	mouseclick(event: Event): void {
		Color.open(this);
	}
}

customElements.define('color-box', ColorBox);
