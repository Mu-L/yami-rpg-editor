import { Title } from '../title/title-bar.ts';

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
		set(rect: { left: number; top: number; width: number; height: number }): void;
	};
	target: HTMLElement;
	offsetX: number;
	mode?: 'close' | 'popup';
	// pointermove 路径用：判断是否同一拖拽序列（运行时挂载，初始化可不赋值）
	relate?(event: PointerEvent): boolean;
}

interface TabItem {
	item: string;
	type?: 'directory' | 'file';
	// tab 运行时挂载：item(string) + text(HTMLElement)
	tab?: HTMLElement;
	[k: string]: any;
}

// tab-item DOM 元素运行时挂载 .item(string) / .text(HTMLElement) 字段
interface TabElement extends HTMLElement {
	item: string;
	text: HTMLElement;
}

interface TabDragTarget extends HTMLElement {
	item: string;
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

		this.data = null;
		this.dragging = null;
		this.selectionIndex = 0;
		this.writeEventEnabled = false;
		this.selectEventEnabled = false;
		this.closedEventEnabled = false;
		this.popupEventEnabled = false;
		this.dirItem = null;
		this.windowPointerup = TabBar.windowPointerup.bind(this);

		this.on('pointerdown', this.pointerdown);
		this.on('dragstart', this.dragstart);
		this.on('dragend', this.dragend);
	}

	read(): any {
		const item = this.querySelector('.selected') as HTMLElement | null;
		return item ? (item as TabElement).item : undefined;
	}

	write(value: any): void {
		const items = this.childNodes;
		const length = items.length;
		if (length !== 0) {
			this.unselect();
			let target: HTMLElement | undefined;
			for (let i = 0; i < length; i++) {
				if ((items[i] as TabElement).item === value) {
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

	update(): void {
		this.clear();
		for (const item of this.data!) {
			let tab = (item as TabItem).tab;
			if (tab === undefined) {
				tab = (item as TabItem).tab = document.createElement('tab-item');
				const text = document.createElement('tab-text');
				text.textContent = this.parseTabName(item);
				(
					tab as HTMLElement & {
						draggable: boolean;
						item: any;
						text: HTMLElement;
					}
				).draggable = true;
				(tab as TabElement).item = item;
				(tab as TabElement & { text: HTMLElement }).text = text;
				tab.appendChild(text);
				if ((item as TabItem).type !== 'directory') {
					const mark = document.createElement('tab-close');
					mark.textContent = '\u2716';
					tab.appendChild(mark);
				}
			}
			this.appendChild(tab);
		}
	}

	parseTabName(item: any): string {
		return `${item.icon} ${item.name}`;
	}

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

	unselect(): void {
		const item = this.querySelector('.selected') as HTMLElement | null;
		if (item) {
			item.removeClass('selected');
		}
	}

	insert(item: any): void {
		if (!this.data!.includes(item)) {
			this.data!.splice(this.selectionIndex + 1, 0, item);
			this.update();
		}
	}

	close(item: any): void {
		if (item === this.dirItem) return;
		const value = this.read();
		if (this.data!.remove(item)) {
			this.update();
			if (this.data!.length > 0) {
				if (value === item || value === undefined || !this.data!.includes(value)) {
					const index = Math.min(this.selectionIndex, this.data!.length - 1);
					this.select(this.data![index]);
				} else {
					// 关闭的不是当前选中的标签，恢复原选中状态
					this.write(value);
				}
			}
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

	closeByProperty(key: string, value: any): void {
		for (const context of this.data!) {
			if (context[key] === value) {
				this.close(context);
				return;
			}
		}
	}

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

	find(meta: any): any {
		for (const node of this.childNodes as unknown as NodeListOf<
			HTMLElement & { item: HTMLElement }
		>) {
			if (node.item && node.item.meta === meta) {
				return node.item;
			}
		}
		return undefined;
	}

	clear(): void {
		this.unselect();
		this.textContent = '';
	}

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

	pointerdown(event: PointerEvent): void {
		this.dragend();
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement;
				if (element.tagName === 'TAB-CLOSE') {
					event.preventDefault();
					const parent = element.parentNode as HTMLElement;
					const dragging: TabDraggingEvent = {
						hint: null as unknown as HTMLElement & {
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
						},
						target: parent,
						offsetX: event.offsetX,
						mode: 'close',
						relate(event: PointerEvent): boolean {
							return (event.target as HTMLElement).closest('tab-item') === parent;
						}
					};
					this.dragging = dragging;
					window.on('pointerup', this.windowPointerup);
					return;
				}
				if (element.tagName === 'TAB-ITEM' && !element.hasClass('selected')) {
					this.select((element as TabElement).item);
				}
				break;
			}
			case 2:
				if (this.popupEventEnabled) {
					switch ((event.target as HTMLElement).tagName) {
						case 'TAB-ITEM':
						case 'TAB-BAR': {
							const dragging: TabDraggingEvent = {
								hint: null as unknown as HTMLElement & {
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
								},
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

	dragstart(event: DragEvent): void {
		if (!this.dragging) {
			const hint = document.createElement('drag-and-drop-hint') as HTMLElement & {
				target: HTMLElement;
				position: 'before' | 'after';
				measure(item: HTMLElement): {
					left: number;
					top: number;
					width: number;
					height: number;
				};
				set(rect: { left: number; top: number; width: number; height: number }): void;
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
			event.preventDefault = Function.empty as unknown as () => void;
			(event.dataTransfer as unknown as { hideDragImage(): void }).hideDragImage();
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

	dragenter(event: DragEvent): void {
		if (this.dragging) {
			event.preventDefault();
			(event.dataTransfer as unknown as { dropEffect: string }).dropEffect = 'move';
		}
	}

	dragleave(event: DragEvent): void {
		if (this.dragging && !this.contains(event.relatedTarget as Node)) {
			this.dragging.offsetX = -1;
			this.dragging.hint.hide();
		}
	}

	dragover(event: DragEvent): void {
		const { dragging } = this;
		if (dragging) {
			event.preventDefault();
			(event.dataTransfer as unknown as { dropEffect: string }).dropEffect = 'move';
			if (dragging.offsetX === event.offsetX) {
				return;
			}
			dragging.offsetX = event.offsetX;
			const element = (event.target as HTMLElement).seek('tab-item');
			const hint = dragging.hint.show();
			if (element.tagName === 'TAB-ITEM') {
				const sItem = (dragging.target as TabDragTarget).item;
				const dItem = (element as TabElement).item;
				if (sItem === dItem) {
					return hint.hide();
				}
				// 避免使用event.offsetX
				const rect = element.rect();
				const middle = rect.width / 2;
				const offsetX = event.clientX - rect.left;
				const position = offsetX < middle ? 'before' : 'after';
				switch (position) {
					case 'before':
						if (hint.target !== element || hint.position !== position) {
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
						if (hint.target !== element || hint.position !== position) {
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

	drop(event: DragEvent): void {
		const { dragging } = this;
		if (!dragging) {
			return;
		}
		event.stopPropagation();
		const hint = dragging.hint;
		if (!hint.hasClass('hidden')) {
			const items = this.data!;
			const sItem = (dragging.target as TabDragTarget).item;
			const dItem = (hint.target as TabDragTarget).item;
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

		this.dragend();
	}

	static windowPointerup(this: TabBar, event: PointerEvent): void {
		const { dragging } = this;
		if (dragging && dragging.relate!(event)) {
			switch (dragging.mode) {
				case 'close':
					{
						const target = (event.target as HTMLElement).closest(
							'tab-item'
						) as TabDragTarget | null;
						if (target && dragging.target === target) {
							this.close(target.item);
						}
					}
					break;
				case 'popup':
					if (dragging.target === event.target) {
						const popup = new Event('popup') as Event & {
							value: any;
							clientX: number;
							clientY: number;
						};
						const item = (event.target as TabElement).item;
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
