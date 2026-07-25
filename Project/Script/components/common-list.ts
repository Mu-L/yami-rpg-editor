import './element-methods.js';

export class CommonList extends HTMLElement {
	elements: any[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selection: HTMLElement | null;
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	popupEventEnabled: boolean;

	constructor() {
		super();

		this.tabIndex = 0;
		this.elements = [] as unknown as any[] & {
			versionId: number;
			count: number;
			start: number;
			end: number;
			head: HTMLElement | null;
			foot: HTMLElement | null;
		};
		this.elements.versionId = 0;
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.elements.head = null;
		this.elements.foot = null;
		this.selection = null;
		this.writeEventEnabled = false;
		this.selectEventEnabled = false;
		this.popupEventEnabled = false;
		this.listenDraggingScrollbarEvent();

		this.on('scroll', this.onScroll);
		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
		this.on('pointerup', this.pointerup);
	}

	read(): any {
		return this.selection?.dataValue;
	}

	write(value: any): void {
		const elements = this.elements;
		const count = elements.count;
		if (count !== 0) {
			this.unselect();
			let index = 0;
			let target = elements[index];
			for (let i = 0; i < count; i++) {
				if (elements[i].dataValue === value) {
					target = elements[(index = i)];
					break;
				}
			}
			target.addClass('selected');
			this.selection = target;
			this.scrollToItem(index);
			if (this.writeEventEnabled) {
				const write: any = new Event('write');
				write.value = target.dataValue;
				this.dispatchEvent(write);
			}
		}
	}

	reload(): this {
		const { elements } = this;
		elements.start = -1;
		elements.count = 0;
		return this;
	}

	appendElement(element: HTMLElement): void {
		const { elements } = this;
		elements[elements.count++] = element;
	}

	update(): void {
		this.clearElements(this.elements.count);

		this.resize();
	}

	resize(): void {
		CommonList.resize(this);
	}

	updateHeadAndFoot(): void {
		CommonList.updateHeadAndFoot(this);
	}

	updateOnResize(_element?: HTMLElement): void {}

	select(element: HTMLElement): void {
		if (element instanceof HTMLElement && this.selection !== element) {
			this.write((element as HTMLElement & { dataValue: any }).dataValue);
			if (this.selectEventEnabled) {
				const select: any = new Event('select');
				select.value = (element as HTMLElement & { dataValue: any }).dataValue;
				this.dispatchEvent(select);
			}
		}
	}

	unselect(): void {
		if (this.selection) {
			this.selection.removeClass('selected');
			this.selection = null;
		}
	}

	scrollToItem(index: number): void {
		const scrollTop = Math.clamp(
			this.scrollTop,
			index * 20 + 20 - this.innerHeight,
			index * 20
		);
		if (this.scrollTop !== scrollTop) {
			this.scrollTop = scrollTop;
		}
	}

	selectRelative(direction: 'up' | 'down'): void {
		const elements = this.elements;
		const count = elements.count;
		if (count > 0) {
			let index = -1;
			const last = count - 1;
			const { selection } = this;
			if (selection) {
				index = elements.indexOf(selection);
			}
			switch (direction) {
				case 'up':
					if (index !== -1) {
						index = Math.max(index - 1, 0);
					} else {
						index = last;
					}
					break;
				case 'down':
					if (index !== -1) {
						index = Math.min(index + 1, last);
					} else {
						index = 0;
					}
					break;
			}
			this.select(elements[index]);
		}
	}

	clearElements(start: number): void {
		CommonList.clearElements(this, start);
	}

	clear(): this {
		this.unselect();
		this.textContent = '';
		this.clearElements(0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		return this;
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'select':
				this.selectEventEnabled = true;
				break;
			case 'popup':
				this.popupEventEnabled = true;
				break;
		}
	}

	onScroll(event: Event): void {
		// 可调用重写的resize
		this.resize();
	}

	keydown(event: KeyboardEvent): void {
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'ArrowUp':
					this.scrollTop -= 20;
					break;
				case 'ArrowDown':
					this.scrollTop += 20;
					break;
			}
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'Space':
					event.preventDefault();
					return;
				case 'ArrowUp':
					event.preventDefault();
					this.selectRelative('up');
					break;
				case 'ArrowDown':
					event.preventDefault();
					this.selectRelative('down');
					break;
			}
		}
	}

	pointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0:
			case 2: {
				const element = event.target as HTMLElement;
				if (element.tagName === 'COMMON-ITEM' && !element.hasClass('selected')) {
					this.select(element);
				}
				break;
			}
		}
	}

	pointerup(event: PointerEvent): void {
		switch (event.button) {
			case 2:
				if (this.popupEventEnabled && document.activeElement === this) {
					const element = (event.target as HTMLElement).seek('common-item');
					if (element.tagName === 'COMMON-ITEM' && element.hasClass('selected')) {
						const popup: any = new Event('popup');
						popup.value = (element as HTMLElement & { dataValue: any }).dataValue;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					} else {
						const popup: any = new Event('popup');
						popup.value = null;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					}
				}
				break;
		}
	}

	static resize = (self: CommonList): void => {
		const st = self.scrollTop;
		const ch = self.innerHeight;
		const elements = self.elements;
		const count = elements.count;
		if (ch === 0) {
			return;
		}
		if (count === 0) {
			self.textContent = '';
			return;
		}
		const start = Math.min(Math.floor(st / 20), count - 1);
		const length = Math.ceil(ch / 20) + 1;
		const end = Math.min(start + length, count);
		if (elements.start !== start || elements.end !== end) {
			elements.start = start;
			elements.end = end;
			self.updateHeadAndFoot();
			const versionId = elements.versionId++;
			for (let i = start; i < end; i++) {
				const element = elements[i];
				(element as HTMLElement & { versionId?: number }).versionId = versionId;
				self.updateOnResize(element);
			}
			const nodes = self.childNodes;
			const last = nodes.length - 1;
			for (let i = last; i >= 0; i--) {
				const element = nodes[i] as HTMLElement & {
					versionId?: number;
				};
				if (element.versionId !== versionId) {
					element.remove();
				}
			}
			if (!elements.foot.parentNode) {
				self.appendChild(elements.foot);
			}
			for (let i = end - 2; i >= start; i--) {
				const element = elements[i];
				if (element.parentNode === null) {
					const next = elements[i + 1];
					self.insertBefore(element, next);
				}
			}
		}
	};

	static updateHeadAndFoot = (self: CommonList): void => {
		const { elements } = self;
		if (elements.head) {
			elements.head.style.marginTop = '';
			elements.head = null;
		}
		if (elements.foot) {
			elements.foot.style.marginBottom = '';
			elements.foot = null;
		}
		const { count, start, end } = elements;
		if (count !== 0) {
			const pad = (self as HTMLElement & { padded?: boolean }).padded ? 1 : 0;
			const mt = start * 20;
			const mb = (count - end + pad) * 20;
			elements.head = elements[start];
			elements.head.style.marginTop = `${mt}px`;
			elements.foot = elements[end - 1];
			elements.foot.style.marginBottom = `${mb}px`;
		}
	};

	static clearElements(self: CommonList, start: number): void {
		let i = start;
		const { elements } = self;
		while (elements[i] !== undefined) {
			elements[i++] = undefined;
		}
	}
}

customElements.define('common-list', CommonList);
