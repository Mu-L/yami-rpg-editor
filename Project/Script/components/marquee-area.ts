import './element-methods.js';
import { MarqueeSaveMap } from '../types/marquee-area.ts';

// ******************************** 选框区域 ********************************

export class MarqueeArea extends HTMLElement {
	selection: HTMLElement;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	visible: boolean;
	saveData: MarqueeSaveMap;

	constructor() {
		super();

		// 创建选框
		const selection = document.createElement('selection');
		this.appendChild(selection.hide() as any);

		// 设置属性
		this.selection = selection;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.visible = false;
		this.saveData = {};
	}

	// 保存状态
	save(key: string = 'default'): void {
		this.saveData[key] = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			scaleX: this.scaleX,
			scaleY: this.scaleY
		};
	}

	// 恢复状态
	restore(key: string = 'default'): void {
		const data = this.saveData[key];
		if (data) {
			for (const k of Object.keys(data)) {
				(this as any)[k] = data[k];
			}
			this.saveData[key] = null;
		}
	}

	// 调整大小
	resize({ width, height }: { width: number; height: number }): void {
		this.style.width = `${width}px`;
		this.style.height = `${height}px`;
	}

	// 擦除矩形
	clear(): void {
		if (this.visible) {
			this.visible = false;
			this.selection.hide();
		}
	}

	// 选取矩形
	select(
		x: number = this.x,
		y: number = this.y,
		width: number = this.width,
		height: number = this.height
	): void {
		// 记录属性
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.visible = true;

		// 设置矩形
		const selection = this.selection;
		const scaleX = this.scaleX;
		const scaleY = this.scaleY;
		const realX = x * scaleX;
		const realY = y * scaleY;
		const realWidth = width * scaleX;
		const realHeight = height * scaleY;
		selection.show();
		selection.style.left = `${realX}px`;
		selection.style.top = `${realY}px`;
		selection.style.width = `${realWidth}px`;
		selection.style.height = `${realHeight}px`;
	}
}

customElements.define('marquee-area', MarqueeArea);
