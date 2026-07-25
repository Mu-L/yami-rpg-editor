import './element-methods.js';

import { ParamListHistory } from './param-history.ts';
import { ctrl } from '../util/event-accessors.ts';
import { DetailBox } from './detail-box.ts';
import { CommonList } from './common-list.ts';
import { Menu } from './menu-list.ts';
import { WindowFrame } from './window-frame.ts';
import { Local } from '../tools/localization.ts';

export class ParamList extends HTMLElement {
	object: any;
	type: string | null;
	data: any[] | null;
	elements: any[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selections: any[] & { count: number };
	start: number | null;
	end: number | null;
	origin: number | null;
	active: number | null;
	flexible: boolean;
	inserting: boolean;
	focusing: boolean;
	dragging: PointerEvent | null;
	history: any;
	togglable: boolean;
	declare height: number;
	autoSwitch: boolean;
	windowPointerup: (event: PointerEvent) => void;
	windowPointermove: (event: PointerEvent) => void;
	declare _paddingTop: number;

	constructor() {
		super();

		this.tabIndex = 0;
		this.object = null;
		this.type = null;
		this.data = null;
		this.elements = [] as any;
		this.elements.versionId = 0;
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.elements.head = null;
		this.elements.foot = null;
		this.selections = [] as any;
		this.selections.count = 0;
		this.start = null;
		this.end = null;
		this.origin = null;
		this.active = null;
		this.flexible = this.hasAttribute('flexible');
		this.inserting = false;
		this.focusing = false;
		this.dragging = null;
		this.history = null;
		this.togglable = false;
		this.windowPointerup = ParamList.windowPointerup.bind(this);
		this.windowPointermove = ParamList.windowPointermove.bind(this);
		this.listenDraggingScrollbarEvent();

		this.on('scroll', this.resize);
		this.on('focus', this.listFocus);
		this.on('blur', this.listBlur);
		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
		this.on('pointerup', this.pointerup);
		this.on('doubleclick', this.doubleclick);
	}

	get innerHeight(): number {
		// 避免细节框折叠时无法更新列表项(假设细节框列表都是弹性的)
		return this.flexible ? this.height : super.innerHeight;
	}

	get paddingTop(): number {
		let pt = this._paddingTop;
		if (pt === undefined) {
			pt = this._paddingTop = parseInt((this as any).css().paddingTop);
		}
		return pt;
	}

	bind(object: any): this {
		object.initialize(this);
		object.initialize = Function.empty as any;
		this.object = object;
		this.type = `yami.${object.type ?? this.id}`;
		this.history = object.history ?? new ParamListHistory(this);
		return this;
	}

	read(): any[] | null {
		return this.data;
	}

	write(data: any[]): void {
		if (this.flexible) {
			this.autoSwitch = true;
		}
		this.data = data;
		this.update();
		this.history.reset();
	}

	update(): void {
		const { data } = this;
		if (!data) return;
		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		const object = this.object;
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			const result = object.parse(item, data, i);
			switch (typeof result) {
				case 'string': {
					const li = document.createElement('param-item') as any;
					li.addClass('one-column');
					li.dataValue = i;
					li.dataItem = item;
					li.textContent = result;
					elements[elements.count++] = li;
					continue;
				}
				case 'object': {
					const li = document.createElement('param-item') as any;
					li.dataValue = i;
					li.dataItem = item;
					elements[elements.count++] = li;
					if (!Array.isArray(result)) {
						li.addClass('one-column');
						li.textContent = result.content;
						if (result.class) {
							li.addClass(result.class);
						}
						continue;
					}

					const [result0, result1] = result;
					if (result0 instanceof HTMLElement) {
						li.appendChild(result0);
					} else if (result0 instanceof Object) {
						const text0 = document.createElement('text');
						text0.addClass('text-0-of-2');
						text0.textContent = result0.content;
						if (result0.class) {
							text0.addClass(result0.class);
						}
						li.appendChild(text0);
					} else {
						const text0 = document.createElement('text');
						text0.addClass('text-0-of-2');
						text0.textContent = result0;
						li.appendChild(text0);
					}

					if (result1 instanceof HTMLElement) {
						li.appendChild(result1);
					} else if (result1 instanceof Object) {
						const text1 = document.createElement('text');
						text1.addClass('text-1-of-2');
						text1.textContent = result1.content;
						if (result1.class) {
							text1.addClass(result1.class);
						}
						li.appendChild(text1);
					} else {
						const text1 = document.createElement('text');
						text1.addClass('text-1-of-2');
						text1.textContent = result1;
						li.appendChild(text1);
					}
					continue;
				}
			}
		}

		const li = document.createElement('param-item') as any;
		const unit = length === 1 ? 'item' : 'items';
		li.addClass('weak');
		li.dataValue = length;
		li.dataItem = null;
		li.textContent = `${length} ${unit}`;
		elements[elements.count++] = li;

		this.clearElements(elements.count);

		this.updateFlexibleHeight();

		object.update?.(this);

		this.resize();
	}

	resize(): void {
		CommonList.resize(this as unknown as CommonList);
	}

	updateFlexibleHeight(): void {
		if (this.flexible) {
			const count = this.elements.count;
			const height = Math.min(count * 20, 500) + 2;
			if (this.height !== height) {
				this.height = height;
				this.style.height = `${height}px`;
			}
			if (this.autoSwitch) {
				this.autoSwitch = false;
				const detailBox = this.parentNode;
				if (detailBox instanceof DetailBox) {
					if (count !== 1) {
						(detailBox as HTMLElement & { open(): void }).open();
					} else {
						(detailBox as HTMLElement & { close(): void }).close();
					}
				}
			}
		}
	}

	updateHeadAndFoot(): void {
		CommonList.updateHeadAndFoot(this as unknown as CommonList);
	}

	updateOnResize(): void {}

	select(start: number, end: number = start): void {
		if (start > end) {
			[start, end] = [end, start];
		}

		const elements = this.elements;
		const count = elements.count;
		start = Math.clamp(start, 0, count - 1);
		end = Math.clamp(end, 0, count - 1);
		if (start !== end) {
			const element = elements[end] as HTMLElement & {
				read(): number;
				dataItem?: any;
			};
			if (!element.dataItem) {
				end--;
			}
		}

		this.unselect();

		this.start = start;
		this.end = end;
		this.origin = start;
		this.active = start;

		this.reselect();
	}

	selectMultiple(active: number): void {
		const origin = this.origin!;
		this.select(origin, active);
		this.origin = origin;
		this.active = Math.clamp(active, this.start!, this.end!);
	}

	selectAll(): void {
		this.select(0, Infinity);
		this.active = this.end;
	}

	unselect(): void {
		if (this.start !== null) {
			const { selections } = this;
			const { count } = selections;
			for (let i = 0; i < count; i++) {
				selections[i].removeClass('selected');
				selections[i] = undefined;
			}
			selections.count = 0;
			if (count > 256) {
				selections.length = 0;
			}
		}
	}

	reselect(): void {
		if (this.focusing && this.start !== null) {
			const { selections } = this;
			const elements = this.elements;
			const start = this.start;
			const end = this.end;
			let count = 0;
			for (let i = start; i <= end!; i++) {
				const element = elements[i];
				selections[count++] = element;
				element.addClass('selected');
			}
			selections.count = count;
		}
	}

	selectUp(): void {
		if (this.start !== null) {
			let index = this.start;
			if (index === this.end) {
				index--;
			}
			this.select(index);
			this.scrollToSelection();
		}
	}

	selectDown(): void {
		if (this.start !== null) {
			let index = this.end!;
			if (index === this.start) {
				index++;
			}
			this.select(index);
			this.scrollToSelection();
		}
	}

	selectMultipleUp(): void {
		if (this.start !== null) {
			const i = this.active! - 1;
			if (i >= 0) {
				this.selectMultiple(i);
			}
			this.scrollToSelection();
		}
	}

	selectMultipleDown(): void {
		if (this.start !== null) {
			const elements = this.elements;
			const count = elements.count;
			const origin = this.origin!;
			const i = this.active! + 1;
			if (i < count - 1 || i === origin) {
				this.selectMultiple(i);
			}
			this.scrollToSelection();
		}
	}

	scrollToSelection(): void {
		if (this.start !== null) {
			const scrollTop = Math.clamp(
				this.scrollTop,
				this.active! * 20 + 20 - this.innerHeight,
				this.active! * 20
			);
			if (this.scrollTop !== scrollTop) {
				this.scrollTop = scrollTop;
			}
		}
	}

	insert(): void {
		if (this.start !== null) {
			this.inserting = true;
			this.object.target = this;
			this.object.open();
		}
	}

	edit(): void {
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start] as HTMLElement & {
				dataItem: any;
			};
			this.inserting = element.dataItem === null;
			switch (this.inserting) {
				case true:
					this.object.target = this;
					this.object.open();
					break;
				case false:
					this.object.target = this;
					this.object.open(this.data![this.start]);
					break;
			}
		}
	}

	toggle(): void {
		if (this.togglable && this.start !== null) {
			let method = 'disable';
			const items: any[] = [];
			const { data, start, end } = this;
			for (let i = start; i <= end!; i++) {
				const item = data![i];
				if (item) {
					switch (method) {
						case 'disable':
							if (!item.enabled) {
								method = 'enable';
								items.length = 0;
							}
							items.push(item);
							continue;
						case 'enable':
							if (!item.enabled) {
								items.push(item);
							}
							continue;
					}
				}
			}
			if (items.length !== 0) {
				this.history.save({
					type: 'toggle',
					array: data,
					method: method,
					items: items
				});
				switch (method) {
					case 'enable':
						this.enableItems(items);
						break;
					case 'disable':
						this.disableItems(items);
						break;
				}
				this.update();
				this.reselect();
				(this as any).dispatchChangeEvent();
			}
		}
	}

	enableItems(items: any[]): void {
		for (const item of items) {
			item.enabled = true;
		}
	}

	disableItems(items: any[]): void {
		for (const item of items) {
			item.enabled = false;
		}
	}

	copy(): void {
		if (this.start !== null) {
			const data = this.data!;
			const start = this.start;
			const end = this.end! + 1;
			const copies = data.slice(start, end);
			if (copies.length > 0) {
				(Clipboard as any).write(this.type, copies);
			}
		}
	}

	paste(): void {
		if (this.start !== null) {
			const copies = (Clipboard as any).read(this.type);
			if (copies) {
				const data = this.data!;
				const start = this.start;
				this.history.save({
					type: 'insert',
					array: data,
					index: start,
					items: copies
				});
				this.object.onPaste?.(this, copies);
				data.splice(start, 0, ...copies);
				this.update();
				this.select(start + copies.length);
				this.scrollToSelection();
				(this as any).dispatchChangeEvent();
			}
		}
	}

	delete(): void {
		if (this.start !== null) {
			const data = this.data!;
			const start = this.start;
			const end = this.end! + 1;
			const items = data.slice(start, end);
			if (items.length > 0) {
				this.history.save({
					type: 'delete',
					array: data,
					index: start,
					items: items
				});
				data.splice(start, end - start);
				this.update();
				this.select(start);
				this.scrollToSelection();
				(this as any).dispatchChangeEvent();
			}
		}
	}

	undo(): void {
		if (!this.dragging && this.history.canUndo()) {
			this.history.restore('undo');
		}
	}

	redo(): void {
		if (!this.dragging && this.history.canRedo()) {
			this.history.restore('redo');
		}
	}

	save(): void {
		const item = this.object.save();
		if (item === undefined) {
			return;
		}
		const start = this.start;
		if (start !== null) {
			const data = this.data!;
			const length = data.length;
			switch (this.inserting) {
				case true:
					this.history.save({
						type: 'insert',
						array: data,
						index: start,
						items: [item]
					});
					data.splice(start, 0, item);
					this.update();
					this.select(start + data.length - length);
					break;
				case false:
					this.history.save({
						type: 'replace',
						array: data,
						index: start,
						swap: data[start]
					});
					data[start] = item;
					this.update();
					this.select(start);
					break;
			}
			this.scrollToSelection();
			(this as any).dispatchChangeEvent();
		}
	}

	clearElements(start: number): void {
		CommonList.clearElements(this as unknown as CommonList, start);
	}

	clear(): this {
		this.unselect();
		this.textContent = '';
		this.data = null;
		this.start = null;
		this.end = null;
		this.history.reset();
		this.clearElements(0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		return this;
	}

	listFocus(event: Event): void {
		if (!this.focusing) {
			this.focusing = true;
			this.start !== null ? this.reselect() : this.select(0);
		}
	}

	listBlur(event: Event): void {
		if (this.dragging) {
			this.windowPointerup(this.dragging);
		}
		if (this.focusing) {
			let element: any = this;
			while ((element = element.parentNode)) {
				if (element instanceof WindowFrame) {
					if (element.hasClass('blur')) {
						return;
					} else {
						break;
					}
				}
			}
			this.focusing = false;
			this.unselect();
		}
	}

	keydown(event: KeyboardEvent): void {
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy();
					this.delete();
					break;
				case 'KeyC':
					this.copy();
					break;
				case 'KeyV':
					this.paste();
					break;
				case 'KeyA':
					this.selectAll();
					break;
				case 'KeyZ':
					if (!(event as any).macRedoKey) {
						this.undo();
						break;
					}
				case 'KeyY':
					this.redo();
					break;
				case 'ArrowUp':
					this.scrollTop -= 20;
					break;
				case 'ArrowDown':
					this.scrollTop += 20;
					break;
				default:
					return;
			}
			event.stopImmediatePropagation();
		} else {
			switch (event.code) {
				case 'Space':
					event.preventDefault();
					return;
				case 'Enter':
				case 'NumpadEnter':
					if (this.start !== null) {
						event.stopPropagation();
						if (this.start === this.end) {
							this.edit();
						}
					}
					break;
				case 'Insert':
					this.insert();
					break;
				case 'Slash':
					this.toggle();
					break;
				case 'Delete':
					this.delete();
					break;
				case 'ArrowUp':
					event.preventDefault();
					event.shiftKey ? this.selectMultipleUp() : this.selectUp();
					break;
				case 'ArrowDown':
					event.preventDefault();
					event.shiftKey ? this.selectMultipleDown() : this.selectDown();
					break;
				default:
					return;
			}
			event.stopImmediatePropagation();
		}
	}

	pointerdown(event: PointerEvent): void {
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 0: {
				let index: number | undefined;
				let element = event.target as HTMLElement;
				if (element === this) {
					if ((this as any).isInContent(event)) {
						index = this.elements.count - 1;
					}
				} else {
					element = element.seek('param-item') as HTMLElement;
					if (element.tagName === 'PARAM-ITEM') {
						index = (element as any).read();
					}
				}
				if (index !== undefined && index >= 0) {
					element = this.elements[index];
					if (event.shiftKey && this.start !== null) {
						this.selectMultiple(index);
					} else {
						this.select(index);
					}
					this.dragging = event;
					(event as any).mode = 'select';
					(event as any).itemIndex = index;
					(event as any).itemHeight = element.clientHeight;
					window.on('pointerup', this.windowPointerup);
					window.on('pointermove', this.windowPointermove);
					(this as any).addScrollListener('vertical', 2, true, () => {
						this.windowPointermove((event as any).latest);
					});
				}
				break;
			}
			case 2: {
				let index: number | undefined;
				let element = event.target as HTMLElement;
				if (element === this) {
					if ((this as any).isInContent(event)) {
						index = this.elements.count - 1;
					}
				} else {
					element = element.seek('param-item') as HTMLElement;
					if (element.tagName === 'PARAM-ITEM') {
						index = (element as any).read();
					}
				}
				if (index !== undefined && index >= 0) {
					const element = this.elements[index];
					if (!element.hasClass('selected')) {
						this.select(index);
					}
				}
				break;
			}
		}
	}

	pointerup(event: PointerEvent): void {
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 2:
				if (this.start !== null && document.activeElement === this) {
					const elements = this.elements;
					const element = elements[this.start] as HTMLElement & {
						dataItem: any;
					};
					const valid = !!element.dataItem;
					const editable = this.start === this.end;
					const pastable = (Clipboard as any).has(this.type);
					const allSelectable = this.data!.length > 0;
					const undoable = this.history.canUndo();
					const redoable = this.history.canRedo();
					const get = Local.createGetter('menuParamList');
					const menuItems: any[] = [
						{
							label: get('edit'),
							accelerator: 'Enter',
							enabled: editable,
							click: () => {
								this.edit();
							}
						},
						{
							label: get('insert'),
							accelerator: 'Insert',
							click: () => {
								this.insert();
							}
						},
						{
							type: 'separator'
						},
						{
							label: get('cut'),
							accelerator: ctrl('X'),
							enabled: valid,
							click: () => {
								this.copy();
								this.delete();
							}
						},
						{
							label: get('copy'),
							accelerator: ctrl('C'),
							enabled: valid,
							click: () => {
								this.copy();
							}
						},
						{
							label: get('paste'),
							accelerator: ctrl('V'),
							enabled: pastable,
							click: () => {
								this.paste();
							}
						},
						{
							label: get('delete'),
							accelerator: 'Delete',
							enabled: valid,
							click: () => {
								this.delete();
							}
						},
						{
							label: get('selectAll'),
							accelerator: ctrl('A'),
							enabled: allSelectable,
							click: () => {
								this.select(0, Infinity);
							}
						},
						{
							label: get('undo'),
							accelerator: ctrl('Z'),
							enabled: undoable,
							click: () => {
								this.undo();
							}
						},
						{
							label: get('redo'),
							accelerator: ctrl('Y'),
							enabled: redoable,
							click: () => {
								this.redo();
							}
						}
					];
					if (this.togglable) {
						menuItems.splice(2, 0, {
							label: get('toggle'),
							accelerator: '/',
							enabled: valid,
							click: () => {
								this.toggle();
							}
						});
					}
					Menu.popup(
						{
							x: event.clientX,
							y: event.clientY
						},
						menuItems
					);
				}
				break;
		}
	}

	doubleclick(event: Event): void {
		if (this.start === this.end) {
			this.edit();
		}
	}

	static windowPointerup(this: ParamList, event: PointerEvent): void {
		const self = this as any;
		const { dragging } = self;
		if (dragging.relate(event)) {
			switch (dragging.mode) {
				case 'select':
					self.removeScrollListener();
					break;
			}
			self.dragging = null;
			window.off('pointerup', self.windowPointerup);
			window.off('pointermove', self.windowPointermove);
		}
	}

	static windowPointermove(this: ParamList, event: PointerEvent): void {
		const self = this as any;
		const { dragging } = self;
		if (dragging.relate(event)) {
			switch (dragging.mode) {
				case 'select': {
					dragging.latest = event;
					const elements = self.elements;
					const count = elements.count;
					if (count > 0) {
						const pt = self.paddingTop;
						const { itemHeight } = dragging;
						const { y } = event.getRelativeCoords(self);
						const line = Math.floor((y - pt) / itemHeight);
						const index = Math.clamp(line, 0, count - 1);
						if (dragging.itemIndex !== index) {
							dragging.itemIndex = index;
							self.selectMultiple(index);
						}
					}
					break;
				}
			}
		}
	}
}

customElements.define('param-list', ParamList);
