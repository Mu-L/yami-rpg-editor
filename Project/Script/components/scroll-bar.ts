import { Timer } from '../util/timer.ts';

// ******************************** 滚动条 ********************************

export class ScrollBar extends HTMLElement {
	target: HTMLElement | null;
	type: string | null;
	thumb: HTMLElement | null;
	timer: Timer | null;
	dragging: PointerEvent | null;
	visible: boolean;

	constructor() {
		super();

		// 设置属性
		this.target = null;
		this.type = null;
		this.thumb = null;
		this.timer = null;
		this.dragging = null;
		this.visible = false;
		this.windowPointerup = this.windowPointerup.bind(this);
		this.windowPointermove = this.windowPointermove.bind(this);

		// 侦听事件
		this.on('pointerdown', this.pointerdown);
	}

	// 绑定目标元素
	bind(target: HTMLElement, type: string): void {
		this.appendChild((this.thumb = document.createElement('scroll-thumb')));
		this.thumb.appendChild(document.createElement('scroll-thumb-inner'));
		this.target = target;
		this.type = type;
		this.addClass(type);
		switch (type) {
			case 'horizontal':
				this.thumb.style.height = '100%';
				break;
			case 'vertical':
				this.thumb.style.width = '100%';
				break;
		}
	}

	// 更新水平滚动条
	updateHorizontalBar(): void {
		const target = this.target!;
		const cw = target.clientWidth;
		const sw = target.scrollWidth;
		if (cw < sw) {
			const sl = target.scrollLeft;
			const p1 = Math.roundTo((sl / sw) * 100, 6);
			const p2 = Math.roundTo((cw / sw) * 100, 6);
			this.updateHorizontalThumb(p1, p2);
			this.updateDisplay(true);
		} else {
			this.updateDisplay(false);
		}
	}

	// 更新垂直滚动条
	updateVerticalBar(): void {
		const target = this.target!;
		const ch = target.clientHeight;
		const sh = target.scrollHeight;
		if (ch < sh) {
			const st = target.scrollTop;
			const p1 = Math.roundTo((st / sh) * 100, 6);
			const p2 = Math.roundTo((ch / sh) * 100, 6);
			this.updateVerticalThumb(p1, p2);
			this.updateDisplay(true);
		} else {
			this.updateDisplay(false);
		}
	}

	// 更新水平滑块
	updateHorizontalThumb(left: number, width: number): void {
		const thumb = this.thumb! as any;
		if (thumb.left !== left) {
			thumb.left = left;
			thumb.style.left = `${left}%`;
		}
		if (thumb.width !== width) {
			thumb.width = width;
			thumb.style.width = `${width}%`;
		}
	}

	// 更新垂直滑块
	updateVerticalThumb(top: number, height: number): void {
		const thumb = this.thumb! as any;
		if (thumb.top !== top) {
			thumb.top = top;
			thumb.style.top = `${top}%`;
		}
		if (thumb.height !== height) {
			thumb.height = height;
			thumb.style.height = `${height}%`;
		}
	}

	// 更新显示状态
	updateDisplay(state: boolean): void {
		if (this.visible !== state) {
			this.visible = state;
			switch (state) {
				case true:
					this.addClass('visible');
					break;
				case false:
					this.removeClass('visible');
					break;
			}
		}
	}

	// 滚动相对位置
	scrollRelative(sign: number): void {
		const { target } = this;
		let { timer } = this;
		if (!timer) {
			timer = this.timer = new Timer({
				duration: 0,
				update: (timer: any) => {
					switch (timer.state) {
						case 'wait': {
							const { dragging } = this;
							if (!dragging) {
								return false;
							}
							if ((dragging as any).target !== this) {
								break;
							}
							const type = this.type;
							const rect = this.thumb!.rect();
							const offset = timer.offset;
							if (type === 'horizontal') {
								const { clientX } = dragging;
								const { left, right } = rect;
								if (
									(offset < 0 && clientX < left) ||
									(offset > 0 && clientX > right)
								) {
								} else {
									break;
								}
							}
							if (type === 'vertical') {
								const { clientY } = dragging;
								const { top, bottom } = rect;
								if (
									(offset < 0 && clientY < top) ||
									(offset > 0 && clientY > bottom)
								) {
								} else {
									break;
								}
							}
							timer.state = 'repeat';
							timer.elapsed = Timer.deltaTime;
							timer.duration = Math.abs(offset) / 5;
							timer.start = timer.end;
							timer.end += offset;
						}
						case 'first':
						case 'repeat': {
							const { elapsed, duration } = timer;
							const { start, end, offset } = timer;
							const time = elapsed / duration;
							const value = start * (1 - time) + end * time;
							let max: number;
							switch (this.type) {
								case 'horizontal':
									max =
										target!.scrollWidth -
										target!.clientWidth;
									target!.setScrollLeft(value);
									break;
								case 'vertical':
									max =
										target!.scrollHeight -
										target!.clientHeight;
									target!.setScrollTop(value);
									break;
							}
							if (
								(offset < 0 && value <= 0) ||
								(offset > 0 && value >= max)
							) {
								return false;
							}
							break;
						}
						case 'delay':
							break;
					}
				},
				callback: (timer: any) => {
					if (this.dragging) {
						switch (timer.state) {
							case 'first':
								timer.state = 'delay';
								timer.elapsed = 0;
								timer.duration = 100;
								return true;
							case 'delay':
							case 'repeat':
								timer.state = 'wait';
								timer.duration = Infinity;
								return true;
						}
					}
				}
			});
		}
		let start: number;
		let offset: number;
		switch (this.type) {
			case 'horizontal':
				start = target!.scrollLeft;
				offset = target!.clientWidth * sign;
				break;
			case 'vertical':
				start = target!.scrollTop;
				offset = target!.clientHeight * sign;
				break;
		}
		timer.state = 'first';
		timer.elapsed = 0;
		timer.duration = Math.abs(offset) / 10;
		timer.start = start;
		timer.end = start + offset;
		timer.offset = offset;
		timer.add();
	}

	// 指针按下事件
	pointerdown(event: PointerEvent): void {
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 0:
				this.target!.focus();
				event.preventDefault();
				event.stopImmediatePropagation();
				if (event.target === this.thumb) {
					this.dragging = event;
					(event as any).mode = 'scroll';
					(event as any).scrollLeft = this.target!.scrollLeft;
					(event as any).scrollTop = this.target!.scrollTop;
					window.on('pointerup', this.windowPointerup);
					window.on('pointermove', this.windowPointermove);
				} else {
					const rect = this.thumb!.rect();
					switch (this.type) {
						case 'horizontal':
							this.scrollRelative(
								event.clientX < rect.left ? -1 : 1
							);
							break;
						case 'vertical':
							this.scrollRelative(
								event.clientY < rect.top ? -1 : 1
							);
							break;
					}
					this.dragging = event;
					(event as any).mode = 'repeat';
					window.on('pointerup', this.windowPointerup);
					window.on('pointermove', this.windowPointermove);
				}
				break;
		}
	}

	// 窗口 - 指针弹起事件
	windowPointerup(event: PointerEvent): void {
		const { dragging } = this;
		if ((dragging as any).relate(event)) {
			switch ((dragging as any).mode) {
				case 'scroll':
					break;
				case 'repeat':
					break;
			}
			this.dragging = null;
			window.off('pointerup', this.windowPointerup);
			window.off('pointermove', this.windowPointermove);
		}
	}

	// 窗口 - 指针移动事件
	windowPointermove(event: PointerEvent): void {
		const { dragging } = this;
		if ((dragging as any).relate(event)) {
			switch ((dragging as any).mode) {
				case 'scroll': {
					const target = this.target!;
					switch (this.type) {
						case 'horizontal':
							if (this.clientWidth !== 0) {
								target.setScrollLeft(
									(dragging as any).scrollLeft +
										((event.clientX -
											(dragging as any).clientX) *
											target.scrollWidth) /
											this.clientWidth
								);
							}
							break;
						case 'vertical':
							if (this.clientHeight !== 0) {
								target.setScrollTop(
									(dragging as any).scrollTop +
										((event.clientY -
											(dragging as any).clientY) *
											target.scrollHeight) /
											this.clientHeight
								);
							}
							break;
					}
					break;
				}
				case 'repeat':
					this.dragging = event;
					(event as any).mode = 'repeat';
					break;
			}
		}
	}
}

customElements.define('scroll-bar', ScrollBar);
