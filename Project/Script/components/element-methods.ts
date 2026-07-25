import { $ } from '../util/dom.ts';
import { Timer } from '../util/timer.ts';
import '../util/event-target.js';
import '../util/node-list.js';

import { Cursor } from '../tools/pointer-object.ts';

HTMLElement.prototype.read = function (this: HTMLElement): any {
	return this.dataValue;
};

HTMLElement.prototype.write = function (this: HTMLElement, value: any): void {
	this.dataValue = value;
};

HTMLElement.prototype.clear = function (this: HTMLElement): HTMLElement {
	this.textContent = '';
	return this;
};

HTMLElement.prototype.enable = function (this: HTMLElement): void {
	this.removeClass('disabled');
};

HTMLElement.prototype.disable = function (this: HTMLElement): void {
	this.addClass('disabled');
};

HTMLElement.prototype.hasClass = function (this: HTMLElement, className: string): boolean {
	return this.classList.contains(className);
};

HTMLElement.prototype.addClass = function (this: HTMLElement, className: string): boolean {
	if (!this.classList.contains(className)) {
		this.classList.add(className);
		return true;
	}
	return false;
};

HTMLElement.prototype.removeClass = function (this: HTMLElement, className: string): boolean {
	if (this.classList.contains(className)) {
		this.classList.remove(className);
		return true;
	}
	return false;
};

HTMLElement.prototype.seek = function (
	this: HTMLElement,
	tagName: string,
	count: number = 1
): HTMLElement {
	let element: HTMLElement = this;
	while (count-- > 0) {
		if (
			element.tagName !== tagName.toUpperCase() &&
			element.parentNode instanceof HTMLElement
		) {
			element = element.parentNode;
			continue;
		}
		break;
	}
	return element;
};

(HTMLElement.prototype as any).css = function (this: HTMLElement): CSSStyleDeclaration {
	return getComputedStyle(this);
};

HTMLElement.prototype.rect = function (this: HTMLElement): DOMRect {
	return this.getBoundingClientRect();
};

HTMLElement.prototype.hide = function (this: HTMLElement): HTMLElement {
	this.addClass('hidden');
	return this;
};

HTMLElement.prototype.show = function (this: HTMLElement): HTMLElement {
	this.removeClass('hidden');
	return this;
};

HTMLElement.prototype.hideChildNodes = function (this: HTMLElement): void {
	for (const childNode of this.childNodes) {
		(childNode as HTMLElement).hide();
	}
};

HTMLElement.prototype.showChildNodes = function (this: HTMLElement): void {
	for (const childNode of this.childNodes) {
		(childNode as HTMLElement).show();
	}
};

// 异步执行可以避免与指针按下行为起冲突
HTMLElement.prototype.getFocus = function (this: any, mode: string | null = null): void {
	setTimeout(() => {
		this.focus();
		switch (mode) {
			case 'all':
				if (this.select) {
					this.select();
					this.scrollLeft = 0;
				}
				break;
			case 'end':
				if (typeof this.selectionStart === 'number') {
					const endIndex = this.value.length;
					this.selectionStart = endIndex;
					this.selectionEnd = endIndex;
				}
				break;
		}
	});
};

HTMLElement.prototype.setTooltip = (function IIFE() {
	const tooltip = $('#tooltip');
	const capture = { capture: true };
	let state: string = 'closed';
	let target: HTMLElement | null = null;
	let rect: DOMRect | null = null;
	let timeStamp: number = 0;
	let clientX: number = 0;
	let clientY: number = 0;
	const timer = new Timer({
		duration: 0,
		callback: () => {
			if (state === 'waiting') {
				let tip = (target as any)?.tip ?? '';
				if (!tip) {
					state = 'closed';
					window.off('keydown', close, capture);
					window.off('pointerdown', close, capture);
					return;
				}
				const hotkey = target?.getAttribute('hotkey');
				if (hotkey) {
					if (tip.includes('\n')) {
						tip = tip.replace('\n', ` (${hotkey})\n`);
					} else {
						tip += ` (${hotkey})`;
					}
				}
				state = 'open';
				tooltip.addClass('open');
				tooltip.innerHTML = tip;
				const { width, height } = tooltip.rect();
				const right = window.innerWidth - width;
				const bottom = window.innerHeight - height;
				const x = Math.min(clientX + 10, right);
				const y = Math.min(clientY + 15, bottom);
				tooltip.style.left = `${x}px`;
				tooltip.style.top = `${y}px`;
				rect = tooltip.rect();
			}
		}
	});

	const close = function (): void {
		switch (state) {
			case 'waiting':
			case 'open':
				state = 'closed';
				rect = null;
				timer.remove();
				tooltip.removeClass('open');
				window.off('keydown', close, capture);
				window.off('pointerdown', close, capture);
				break;
		}
	};

	const pointermove = function (this: HTMLElement, event: PointerEvent): void {
		if (timeStamp === event.timeStamp) {
			return;
		}
		timeStamp = event.timeStamp;
		switch (state) {
			case 'closed':
				if (target !== this) {
					state = 'waiting';
					target = this;
					timer.elapsed = 0;
					timer.duration = 250;
					timer.add();
					clientX = event.clientX;
					clientY = event.clientY;
					window.on('keydown', close, capture);
					window.on('pointerdown', close, capture);
				}
				break;
			case 'waiting':
				if (target === this) {
					timer.elapsed = 0;
					clientX = event.clientX;
					clientY = event.clientY;
				} else {
					close();
				}
				break;
			case 'open':
				if (target !== this) {
					close();
				}
				break;
		}
	};

	const pointerleave = function (this: HTMLElement, event: PointerEvent): void {
		if (
			!(event.relatedTarget instanceof HTMLElement && tooltip.contains(event.relatedTarget))
		) {
			target = null;
			close();
		}
	};

	tooltip.on('pointerleave', (event: PointerEvent) => {
		target = null;
		close();
	});

	return function (this: any, tip: string | (() => string)): void {
		if ('tip' in this === false) {
			this.on('pointermove', pointermove);
			this.on('pointerleave', pointerleave);
		}
		switch (typeof tip) {
			case 'string':
				this.tip = tip;
				break;
			case 'function':
				Object.defineProperty(this, 'tip', {
					configurable: true,
					get: tip as () => string
				});
				break;
		}
	};
})();

HTMLElement.prototype.addScrollbars = function () {
	const hBar = document.createElement('scroll-bar');
	const vBar = document.createElement('scroll-bar');
	const corner = document.createElement('scroll-corner');
	const parent = this.parentNode;
	const next = this.nextSibling;
	if (next) {
		parent.insertBefore(hBar, next);
		parent.insertBefore(vBar, next);
		parent.insertBefore(corner, next);
	} else {
		parent.appendChild(hBar);
		parent.appendChild(vBar);
		parent.appendChild(corner);
	}
	hBar.bind(this, 'horizontal');
	vBar.bind(this, 'vertical');

	const wheel = (event: WheelEvent) => {
		this.dispatchEvent(new WheelEvent('wheel', event));
	};
	hBar.on('wheel', wheel);
	vBar.on('wheel', wheel);
	corner.on('wheel', wheel);

	// 使用自定义的userscroll代替内置的scroll有以下原因: scroll是异步的，触发时机是在Promise后Animation前 如果在Animation中滚动会推迟到下一帧触发事件 userscroll由于手动调用可以避免不需要触发的情况
	const userscroll = new Event('userscroll');

	this.beginScrolling = function () {
		hBar.addClass('dragging');
		vBar.addClass('dragging');
	};

	this.endScrolling = function () {
		hBar.removeClass('dragging');
		vBar.removeClass('dragging');
	};

	this.setScroll = function (left: number, top: number) {
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		this.scroll(left, top);
		if (this.scrollLeft !== sl || this.scrollTop !== st) {
			this.dispatchEvent(userscroll);
		}
	};

	this.setScrollLeft = function (left: number) {
		const sl = this.scrollLeft;
		this.scrollLeft = left;
		if (this.scrollLeft !== sl) {
			this.dispatchEvent(userscroll);
		}
	};

	this.setScrollTop = function (top: number) {
		const st = this.scrollTop;
		this.scrollTop = top;
		if (this.scrollTop !== st) {
			this.dispatchEvent(userscroll);
		}
	};

	let withCorner = false;
	this.updateScrollbars = function () {
		if (this.clientWidth < this.scrollWidth && this.clientHeight < this.scrollHeight) {
			if (!withCorner) {
				withCorner = true;
				hBar.addClass('with-corner');
				vBar.addClass('with-corner');
				corner.addClass('visible');
			}
		} else {
			if (withCorner) {
				withCorner = false;
				hBar.removeClass('with-corner');
				vBar.removeClass('with-corner');
				corner.removeClass('visible');
			}
		}
		hBar.updateHorizontalBar();
		vBar.updateVerticalBar();
	};
};

HTMLElement.prototype.addSetScrollMethod = function () {
	const userscroll = new Event('userscroll');

	this.setScroll = function (left: number, top: number) {
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		this.scroll(left, top);
		if (this.scrollLeft !== sl || this.scrollTop !== st) {
			this.dispatchEvent(userscroll);
		}
	};
};

HTMLElement.prototype.hasScrollBar = function (): boolean {
	return this.clientWidth < this.scrollWidth || this.clientHeight < this.scrollHeight;
};

HTMLElement.prototype.isInContent = function (event: MouseEvent): boolean {
	const coords = event.getRelativeCoords(this);
	const x = coords.x - this.scrollLeft;
	const y = coords.y - this.scrollTop;
	return x >= 0 && x < this.clientWidth && y >= 0 && y < this.clientHeight;
};

HTMLElement.prototype.dispatchChangeEvent = (function IIFE() {
	const changes = [
		new Event('change', { bubbles: true }),
		new Event('change', { bubbles: true })
	];
	return function (index = 0) {
		this.dispatchEvent(changes[index]);
	};
})();

HTMLElement.prototype.dispatchResizeEvent = (function IIFE() {
	const resize = new Event('resize');
	return function () {
		this.dispatchEvent(resize);
	};
})();

HTMLElement.prototype.dispatchUpdateEvent = (function IIFE() {
	const update = new Event('update');
	return function () {
		this.dispatchEvent(update);
	};
})();

(HTMLElement.prototype as any).listenDraggingScrollbarEvent = (function IIFE() {
	const defaultPointerdown = function (event) {
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 0:
				if (event.altKey) {
					event.preventDefault();
					event.stopImmediatePropagation();
					this.dragging = event;
					event.mode = 'scroll';
					event.scrollLeft = this.scrollLeft;
					event.scrollTop = this.scrollTop;
					Cursor.open('cursor-grab');
					window.on('pointerup', this.scrollPointerup);
					window.on('pointermove', this.scrollPointermove);
				}
				break;
		}
	};

	const pointerup = function (event) {
		const { dragging } = this;
		if (dragging.relate(event)) {
			switch (dragging.mode) {
				case 'scroll':
					Cursor.close('cursor-grab');
					break;
			}
			this.dragging = null;
			window.off('pointerup', this.scrollPointerup);
			window.off('pointermove', this.scrollPointermove);
		}
	};

	const pointermove = function (event) {
		const { dragging } = this;
		if (dragging.relate(event)) {
			switch (dragging.mode) {
				case 'scroll':
					this.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
					this.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
					break;
			}
		}
	};

	return function (pointerdown = defaultPointerdown, options) {
		this.scrollPointerup = pointerup.bind(this);
		this.scrollPointermove = pointermove.bind(this);
		this.on('pointerdown', pointerdown, options);
	};
})();
