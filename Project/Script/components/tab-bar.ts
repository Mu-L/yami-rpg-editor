import { Title } from '../title/title-bar.ts';

// ******************************** 标签栏 ********************************

// 拖拽中的事件聚合体（pointerdown / dragstart 共用）
interface TabDraggingEvent {
	hint: HTMLElement & {
		target: HTMLElement;
		position: 'before' | 'after';
		measure(item: HTMLElement): {
			left: number;
			top: number;
			width: number;
			height: number;
		};
		set(rect: {
			left: number;
			top: number;
			width: number;
			height: number;
		}): void;
	};
	target: HTMLElement;
	offsetX: number;
	mode?: 'close' | 'popup';
}

export class TabBar extends HTMLElement {
	data: any[] | null;
	dragging: TabDraggingEvent | null;
	selectionIndex: number;
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	closedEventEnabled: boolean;
	popupEventEnabled: boolean;
	windowPointerup: (event: PointerEvent) => void;
	dirItem: any;

	constructor() {
		super();

		// 设置属性
		this.data = null;
		this.dragging = null;
		this.selectionIndex = 0;
		this.writeEventEnabled = false;
		this.selectEventEnabled = false;
		this.closedEventEnabled = false;
		this.popupEventEnabled = false;
		this.dirItem = null;
		this.windowPointerup = TabBar.windowPointerup.bind(this);

		// 侦听事件
		this.on('pointerdown', this.pointerdown);
		this.on('dragstart', this.dragstart);
		this.on('dragend', this.dragend);
	}

	// 读取数据
	read(): any {
		const item = this.querySelector('.selected') as HTMLElement | null;
		return item ? (item as any).item : undefined;
	}

	// 写入数据
	write(value: any): void {
		const items = this.childNodes;
		const length = items.length;
		if (length !== 0) {
			this.unselect();
			let target: HTMLElement | undefined;
			for (let i = 0; i < length; i++) {
				if ((items[i] as any).item === value) {
					this.selectionIndex = i;
					target = items[i] as HTMLElement;
					break;
				}
			}
			if (target !== undefined) {
				target.addClass('selected');
			}
			if (this.writeEventEnabled) {
				const write = new Event('write') as Event & {
					value: any;
				};
				write.value = target ? value : undefined;
				this.dispatchEvent(write);
			}
		}
	}

	// 更新标签列表
	update(): void {
		this.clear();
		for (const item of this.data!) {
			let tab = (item as any).tab;
			if (tab === undefined) {
				tab = (item as any).tab = document.createElement('tab-item');
				const text = document.createElement('tab-text');
				text.textContent = this.parseTabName(item);
				(
					tab as HTMLElement & {
						draggable: boolean;
						item: any;
						text: HTMLElement;
					}
				).draggable = true;
				(tab as any).item = item;
				(tab as any).text = text;
				tab.appendChild(text);
				// 给目录以外的标签添加关闭按钮
				if ((item as any).type !== 'directory') {
					const mark = document.createElement('tab-close');
					mark.textContent = '\u2716';
					tab.appendChild(mark);
				}
			}
			this.appendChild(tab);
		}
	}

	// 解析标签名称
	parseTabName(item: any): string {
		return `${item.icon} ${item.name}`;
	}

	// 选择项目
	select(item: any): void {
		if (this.read() !== item) {
			this.write(item);
			if (this.selectEventEnabled) {
				const select = new Event('select') as Event & {
					value: any;
				};
				select.value = item;
				this.dispatchEvent(select);
			}
		}
	}

	// 取消选择
	unselect(): void {
		const item = this.querySelector('.selected') as HTMLElement | null;
		if (item) {
			item.removeClass('selected');
		}
	}

	// 插入项目
	insert(item: any): void {
		if (!this.data!.includes(item)) {
			// 索引超过长度时会加入到末尾
			this.data!.splice(this.selectionIndex + 1, 0, item);
			this.update();
		}
	}

	// 关闭项目
	close(item: any): void {
		if (item === this.dirItem) return;
		const value = this.read();
		if (this.data!.remove(item)) {
			this.update();
			if (this.closedEventEnabled) {
				const closed = new Event('closed') as Event & {
					closedItems: any[];
					lastValue: any;
				};
				closed.closedItems = [item];
				closed.lastValue = value;
				this.dispatchEvent(closed);
			}
		}
	}

	// 关闭属性匹配的项目
	closeByProperty(key: string, value: any): void {
		for (const context of this.data!) {
			if ((context as any)[key] === value) {
				this.close(context);
				return;
			}
		}
	}

	// 关闭其他项目
	closeOtherTabs(item: any): void {
		const value = this.read();
		const items = this.data!;
		let i = items.length;
		if (i <= 1) return;
		const closedItems: any[] = [];
		while (--i >= 0) {
			const tab = items[i];
			if (tab === item) continue;
			if (tab === this.dirItem) continue;
			items.splice(i, 1);
			closedItems.push(tab);
		}
		if (closedItems.length !== 0) {
			this.update();
			if (this.closedEventEnabled) {
				const closed = new Event('closed') as Event & {
					closedItems: any[];
					lastValue: any;
				};
				closed.closedItems = closedItems;
				closed.lastValue = value;
				this.dispatchEvent(closed);
			}
		}
	}

	// 关闭右侧项目
	closeTabsToTheRight(item: any): void {
		const value = this.read();
		const items = this.data!;
		const index = items.indexOf(item);
		if (index === -1) return;
		const closedItems: any[] = [];
		let i = items.length;
		while (--i > index) {
			const tab = items[i];
			if (tab === this.dirItem) continue;
			items.splice(i, 1);
			closedItems.push(tab);
		}
		if (closedItems.length !== 0) {
			this.update();
			if (this.closedEventEnabled) {
				const closed = new Event('closed') as Event & {
					closedItems: any[];
					lastValue: any;
				};
				closed.closedItems = closedItems;
				closed.lastValue = value;
				this.dispatchEvent(closed);
			}
		}
	}

	// 查找项目
	find(meta: any): any {
		for (const node of this.childNodes as any) {
			if (node.item && node.item.meta === meta) {
				return node.item;
			}
		}
		return undefined;
	}

	// 清除列表
	clear(): void {
		this.unselect();
		this.textContent = '';
	}

	// 添加事件
	on = (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		EventTarget.prototype.on.call(this, type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'select':
				this.selectEventEnabled = true;
				break;
			case 'closed':
				this.closedEventEnabled = true;
				break;
			case 'popup':
				this.popupEventEnabled = true;
				break;
		}
	};

	// 指针按下事件
	pointerdown(event: PointerEvent): void {
		this.dragend();
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement;
				if (element.tagName === 'TAB-CLOSE') {
					// 阻止拖拽开始事件
					event.preventDefault();
					const dragging: TabDraggingEvent = {
						hint: null as any,
						target: element.parentNode as HTMLElement,
						offsetX: event.offsetX,
						mode: 'close'
					};
					this.dragging = dragging;
					window.on('pointerup', this.windowPointerup);
					return;
				}
				if (
					element.tagName === 'TAB-ITEM' &&
					!element.hasClass('selected')
				) {
					this.select((element as any).item);
				}
				break;
			}
			case 2:
				if (this.popupEventEnabled) {
					switch ((event.target as HTMLElement).tagName) {
						case 'TAB-ITEM':
						case 'TAB-BAR': {
							const dragging: TabDraggingEvent = {
								hint: null as any,
								target: event.target as HTMLElement,
								offsetX: event.offsetX,
								mode: 'popup'
							};
							this.dragging = dragging;
							window.on('pointerup', this.windowPointerup);
							break;
						}
					}
				}
				break;
		}
	}

	// 拖拽开始事件
	dragstart(event: DragEvent): void {
		if (!this.dragging) {
			const hint = document.createElement(
				'drag-and-drop-hint'
			) as HTMLElement & {
				target: HTMLElement;
				position: 'before' | 'after';
				measure(item: HTMLElement): {
					left: number;
					top: number;
					width: number;
					height: number;
				};
				set(rect: {
					left: number;
					top: number;
					width: number;
					height: number;
				}): void;
				hide(): HTMLElement;
				addClass(name: string): boolean;
				hasClass(name: string): boolean;
			};
			const dragging: TabDraggingEvent = {
				hint,
				target: event.target as HTMLElement,
				offsetX: event.offsetX
			};
			this.dragging = dragging;
			Object.defineProperty(event, 'offsetX', { writable: true });
			event.preventDefault = Function.empty as any;
			(event.dataTransfer as any).hideDragImage();
			hint.addClass('for-tab');
			this.parentNode!.insertBefore(hint.hide(), this);
			this.addClass('dragging');
			Title.updateAppRegion();
			this.on('dragenter', this.dragenter);
			this.on('dragleave', this.dragleave);
			this.on('dragover', this.dragover);
			this.on('drop', this.drop);
		}
	}

	// 拖拽结束事件
	dragend(event?: DragEvent): void {
		if (this.dragging) {
			this.removeClass('dragging');
			this.parentNode!.removeChild(this.dragging.hint);
			this.dragging = null;
			this.off('dragenter', this.dragenter);
			this.off('dragleave', this.dragleave);
			this.off('dragover', this.dragover);
			this.off('drop', this.drop);
		}
	}

	// 拖拽进入事件
	dragenter(event: DragEvent): void {
		if (this.dragging) {
			event.preventDefault();
			(event.dataTransfer as any).dropEffect = 'move';
		}
	}

	// 拖拽离开事件
	dragleave(event: DragEvent): void {
		if (this.dragging && !this.contains(event.relatedTarget as Node)) {
			this.dragging.offsetX = -1;
			this.dragging.hint.hide();
		}
	}

	// 拖拽悬停事件
	dragover(event: DragEvent): void {
		const { dragging } = this;
		if (dragging) {
			event.preventDefault();
			(event.dataTransfer as any).dropEffect = 'move';
			if (dragging.offsetX === event.offsetX) {
				return;
			}
			dragging.offsetX = event.offsetX;
			const element = (event.target as HTMLElement).seek('tab-item');
			const hint = dragging.hint.show();
			if (element.tagName === 'TAB-ITEM') {
				const sItem = (dragging.target as any).item;
				const dItem = (element as any).item;
				if (sItem === dItem) {
					return hint.hide();
				}
				// 避免使用event.offsetX
				// 这样当指针落在关闭按钮上也能计算位置
				const rect = element.rect();
				const middle = rect.width / 2;
				const offsetX = event.clientX - rect.left;
				const position = offsetX < middle ? 'before' : 'after';
				switch (position) {
					case 'before':
						if (
							hint.target !== element ||
							hint.position !== position
						) {
							if (element.previousSibling === dragging.target) {
								return hint.hide();
							}
							const r = hint.measure(element);
							r.left -= 1;
							r.width = 2;
							hint.target = element;
							hint.position = position;
							hint.set(r);
						}
						break;
					case 'after':
						if (
							hint.target !== element ||
							hint.position !== position
						) {
							if (element.nextSibling === dragging.target) {
								return hint.hide();
							}
							const r = hint.measure(element);
							r.left += r.width - 1;
							r.width = 2;
							hint.target = element;
							hint.position = position;
							hint.set(r);
						}
						break;
				}
			} else {
				const elements = this.childNodes;
				const index = elements.length - 1;
				const element = elements[index] as HTMLElement;
				if (element === dragging.target) {
					return hint.hide();
				}
				if (
					element !== undefined &&
					(hint.target !== element || hint.position !== 'after')
				) {
					const r = hint.measure(element);
					r.left += r.width - 1;
					r.width = 2;
					hint.target = element;
					hint.position = 'after';
					hint.set(r);
				}
			}
		}
	}

	// 拖拽释放事件
	drop(event: DragEvent): void {
		const { dragging } = this;
		if (!dragging) {
			return;
		}
		event.stopPropagation();
		const hint = dragging.hint;
		if (!hint.hasClass('hidden')) {
			const items = this.data!;
			const sItem = (dragging.target as any).item;
			const dItem = (hint.target as any).item;
			if (items.remove(sItem)) {
				let dIndex = items.indexOf(dItem);
				if (hint.position === 'after') {
					dIndex++;
				}
				items.splice(dIndex, 0, sItem);
				this.selectionIndex = dIndex;
				this.update();
			}
		}

		// 创建项目后不能触发拖拽结束事件
		this.dragend();
	}

	// 窗口 - 指针弹起事件
	static windowPointerup(this: TabBar, event: PointerEvent): void {
		const { dragging } = this;
		if (dragging && (dragging as any).relate(event)) {
			switch (dragging.mode) {
				case 'close':
					if (dragging.target === event.target) {
						this.close(
							((event.target as any).parentNode as any).item
						);
					}
					break;
				case 'popup':
					if (dragging.target === event.target) {
						const popup = new Event('popup') as Event & {
							value: any;
							clientX: number;
							clientY: number;
						};
						const item = (event.target as any).item;
						popup.value = item ?? null;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					}
					break;
			}
			this.dragging = null;
			window.off('pointerup', this.windowPointerup);
		}
	}
}

customElements.define('tab-bar', TabBar);
