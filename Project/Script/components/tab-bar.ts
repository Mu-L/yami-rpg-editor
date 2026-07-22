import { Title } from '../title/title-bar.ts';

// ******************************** 标签栏 ********************************

export class TabBar extends HTMLElement {
	data: any[] | null; //:array
	dragging: DragEvent | PointerEvent | null; //:event
	selectionIndex: number; //:number
	writeEventEnabled: boolean; //:boolean
	selectEventEnabled: boolean; //:boolean
	closedEventEnabled: boolean; //:boolean
	popupEventEnabled: boolean; //:boolean
	windowPointerup: (event: PointerEvent) => void; //:function
	dirItem: any; //:any

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
		(this as any).on('pointerdown', this.pointerdown);
		(this as any).on('dragstart', this.dragstart);
		(this as any).on('dragend', this.dragend);
	}

	// 读取数据
	read(): any {
		const item = this.querySelector('.selected') as any;
		return item ? item.item : undefined;
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
				const write: any = new Event('write');
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
				(tab as any).draggable = true;
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
				const select: any = new Event('select');
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
				const closed: any = new Event('closed');
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
				const closed: any = new Event('closed');
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
				const closed: any = new Event('closed');
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
					this.dragging = event;
					(event as any).mode = 'close';
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
						case 'TAB-BAR':
							this.dragging = event;
							(event as any).mode = 'popup';
							window.on('pointerup', this.windowPointerup);
							break;
					}
				}
				break;
		}
	}

	// 拖拽开始事件
	dragstart(event: DragEvent): void {
		if (!this.dragging) {
			this.dragging = event;
			Object.defineProperty(event, 'offsetX', { writable: true });
			event.preventDefault = Function.empty as any;
			(event as any).dataTransfer.hideDragImage();
			(event as any).hint = document.createElement('drag-and-drop-hint');
			((event as any).hint as HTMLElement).addClass('for-tab');
			this.parentNode!.insertBefore((event as any).hint.hide(), this);
			this.addClass('dragging');
			Title.updateAppRegion();
			(this as any).on('dragenter', this.dragenter);
			(this as any).on('dragleave', this.dragleave);
			(this as any).on('dragover', this.dragover);
			(this as any).on('drop', this.drop);
		}
	}

	// 拖拽结束事件
	dragend(event?: DragEvent): void {
		if (this.dragging) {
			this.removeClass('dragging');
			this.parentNode!.removeChild((this.dragging as any).hint);
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
			(event as any).dataTransfer.dropEffect = 'move';
		}
	}

	// 拖拽离开事件
	dragleave(event: DragEvent): void {
		if (this.dragging && !this.contains(event.relatedTarget as Node)) {
			(this.dragging as any).offsetX = -1;
			(this.dragging as any).hint.hide();
		}
	}

	// 拖拽悬停事件
	dragover(event: DragEvent): void {
		const { dragging } = this;
		if (dragging) {
			event.preventDefault();
			(event as any).dataTransfer.dropEffect = 'move';
			if ((dragging as any).offsetX === event.offsetX) {
				return;
			}
			(dragging as any).offsetX = event.offsetX;
			const element = (event.target as HTMLElement).seek('tab-item');
			const hint = (dragging as any).hint.show();
			if (element.tagName === 'TAB-ITEM') {
				const sItem = (dragging as any).target.item;
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
							(hint as any).target !== element ||
							(hint as any).position !== position
						) {
							if (
								element.previousSibling ===
								(dragging as any).target
							) {
								return hint.hide();
							}
							const rect = (hint as any).measure(element);
							rect.left -= 1;
							rect.width = 2;
							(hint as any).target = element;
							(hint as any).position = position;
							(hint as any).set(rect);
						}
						break;
					case 'after':
						if (
							(hint as any).target !== element ||
							(hint as any).position !== position
						) {
							if (
								element.nextSibling === (dragging as any).target
							) {
								return hint.hide();
							}
							const rect = (hint as any).measure(element);
							rect.left += rect.width - 1;
							rect.width = 2;
							(hint as any).target = element;
							(hint as any).position = position;
							(hint as any).set(rect);
						}
						break;
				}
			} else {
				const elements = this.childNodes;
				const index = elements.length - 1;
				const element = elements[index] as HTMLElement;
				if (element === (dragging as any).target) {
					return hint.hide();
				}
				if (
					element !== undefined &&
					((hint as any).target !== element ||
						(hint as any).position !== 'after')
				) {
					const rect = (hint as any).measure(element);
					rect.left += rect.width - 1;
					rect.width = 2;
					(hint as any).target = element;
					(hint as any).position = 'after';
					(hint as any).set(rect);
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
		const hint = (dragging as any).hint;
		if (!hint.hasClass('hidden')) {
			const items = this.data!;
			const sItem = (dragging as any).target.item;
			const dItem = (hint as any).target.item;
			if (items.remove(sItem)) {
				let dIndex = items.indexOf(dItem);
				if ((hint as any).position === 'after') {
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
		const { dragging } = this as any;
		if (dragging.relate(event)) {
			switch (dragging.mode) {
				case 'close':
					if (dragging.target === event.target) {
						this.close((event.target as any).parentNode.item);
					}
					break;
				case 'popup':
					if (dragging.target === event.target) {
						const popup: any = new Event('popup');
						const item = (event.target as any).item;
						popup.value = item ?? null;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					}
					break;
			}
			(this as any).dragging = null;
			window.off('pointerup', this.windowPointerup);
		}
	}
}

customElements.define('tab-bar', TabBar);
