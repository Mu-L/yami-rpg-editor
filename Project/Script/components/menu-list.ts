import { Timer } from '../util/timer.ts';
import { Window } from '../tools/window-object.ts';

export class MenuList extends HTMLElement {
	state: string;
	callback: (() => void) | null;
	dataItems: any[] | null;
	selection: HTMLElement | null;
	popupTimer: any;
	closeTimer: any;
	parent: HTMLElement | null;
	submenu: MenuList | null;
	buttonPressed: boolean;
	minWidth: number;
	parentMenuItem: HTMLElement | null;
	windowBlur: (event: any) => void;
	windowKeydown: (event: any) => void;
	windowPointerdown: (event: any) => void;
	windowPointerup: (event: any) => void;
	windowPointerover: (event: any) => void;
	windowPointerout: (event: any) => void;

	static selection: HTMLElement | null;
	static popupSubmenu: (menu: MenuList, x?: number, y?: number) => void;
	static reselect: () => void;
	static select: (item: HTMLElement) => void;
	static unselect: () => void;
	static closeSubmenu: () => void;

	constructor() {
		super();

		this.state = 'closed';
		this.callback = null;
		this.dataItems = null;
		this.selection = null;
		this.popupTimer = null;
		this.closeTimer = null;
		this.parent = null;
		this.submenu = null;
		this.buttonPressed = false;
		this.minWidth = 0;
		this.windowBlur = MenuList.windowBlur.bind(this);
		this.windowKeydown = MenuList.windowKeydown.bind(this);
		this.windowPointerdown = MenuList.windowPointerdown.bind(this);
		this.windowPointerup = MenuList.windowPointerup.bind(this);
		this.windowPointerover = MenuList.windowPointerover.bind(this);
		this.windowPointerout = MenuList.windowPointerout.bind(this);
	}

	popup(options: any, items: any) {
		this.close();
		this.state = 'open';
		this.dataItems = items;
		this.callback = options.close ?? null;
		this.parent = options.parent ?? null;
		this.minWidth = options.minWidth ?? 180;
		for (let i = 0; i < items.length; i++) {
			this.appendChild(this.createItem(items[i]));
		}

		document.body.appendChild(this);
		this.computeMenuWidth();
		const { width, height } = this.rect();
		const dpx = 1 / window.devicePixelRatio;
		const right = window.innerWidth - width - dpx;
		const bottom = window.innerHeight - height - dpx;
		const x = options.x ?? 0;
		const y = options.y ?? 0;
		this.style.left = `${Math.min(x + dpx, right)}px`;
		this.style.top = `${Math.min(y + dpx, bottom)}px`;
		this.style.zIndex = String(Window.frames.length + 1);

		window.event?.stopPropagation();
		window.on('blur', this.windowBlur);
		window.on('pointerdown', this.windowPointerdown);
		window.on('pointerup', this.windowPointerup);
		window.on('pointerover', this.windowPointerover);
		window.on('pointerout', this.windowPointerout);
		window.on('keydown', this.windowKeydown, { capture: true });
		// window.on('keyup', this.windowKeyup, {capture: true})
		this.on('pointerenter', this.pointerenter);
	}

	computeMenuWidth() {
		let labelWidth = 0;
		let acceleratorWidth = 0;
		for (const li of this.childNodes) {
			const { label, accelerator } = li;
			if (label !== undefined) {
				labelWidth = Math.max(labelWidth, label.offsetWidth);
			}
			if (accelerator !== undefined) {
				acceleratorWidth = Math.max(acceleratorWidth, accelerator.offsetWidth);
			}
		}
		let padding = 48;
		if (labelWidth > 0 && acceleratorWidth > 0) {
			padding += 10;
		}
		const width = labelWidth + acceleratorWidth + padding;
		this.style.width = `${Math.max(width, this.minWidth)}px`;
	}

	close() {
		if (this.state === 'open') {
			this.state = 'closed';
			this.unselect();
			this.callback?.();
			this.callback = null;
			this.submenu?.close();
			this.dataItems = null;
			this.parent = null;
			this.buttonPressed = false;
			document.body.removeChild(this.clear());

			window.off('blur', this.windowBlur);
			window.off('pointerdown', this.windowPointerdown);
			window.off('pointerup', this.windowPointerup);
			window.off('pointerover', this.windowPointerover);
			window.off('pointerout', this.windowPointerout);
			window.off('keydown', this.windowKeydown, { capture: true });
			// window.off('keyup', this.windowKeyup, {capture: true})
			this.off('pointerenter', this.pointerenter);
		}
	}

	clear() {
		this.textContent = '';
		return this;
	}

	createItem(item: any) {
		switch (item.type) {
			case 'separator':
				return document.createElement('menu-separator');
			default: {
				const li = document.createElement('menu-item');
				li.dataValue = item;

				if (item.enabled === false) {
					li.addClass('disabled');
				}

				if (item.checked === true) {
					const mark = document.createElement('menu-checked');
					mark.textContent = '✓';
					li.appendChild(mark);
				}

				if (item.icon !== undefined) {
					li.appendChild(item.icon);
				}

				if (item.label !== undefined) {
					const label = document.createElement('menu-label');
					label.textContent = item.label;
					li.label = label;
					li.appendChild(label);
				}

				if (item.accelerator !== undefined) {
					const accelerator = document.createElement('menu-accelerator');
					accelerator.textContent = item.accelerator;
					li.accelerator = accelerator;
					li.appendChild(accelerator);
				}

				if (item.style !== undefined) {
					li.addClass(item.style);
				}

				if (item.submenu !== undefined) {
					const accelerator = document.createElement('menu-sub-mark');
					accelerator.textContent = '>';
					li.appendChild(accelerator);
				}
				return li;
			}
		}
	}

	select(element: any) {
		if (this.selection !== element) {
			this.unselect();
			this.selection = element;
			this.selection.addClass('selected');
		}
	}

	unselect() {
		if (this.selection) {
			this.selection.removeClass('selected');
			this.selection = null;
			if (this.popupTimer) {
				this.popupTimer.remove();
				this.popupTimer = null;
			}
		}
	}

	reselect(offset: any) {
		const elements = [];
		for (const child of this.childNodes) {
			const element = child as HTMLElement;
			if (element.tagName === 'MENU-ITEM' && !element.hasClass('disabled')) {
				elements.push(element);
			}
		}
		const length = elements.length;
		if (length === 0) {
			return;
		}
		if (this.selection) {
			const last = elements.indexOf(this.selection);
			const index = (last + offset + length) % length;
			this.select(elements[index]);
		} else {
			switch (offset) {
				case 1:
					this.select(elements[0]);
					break;
				case -1:
					this.select(elements[length - 1]);
					break;
			}
		}
	}

	popupSubmenu(delay: any) {
		const element = this.selection;
		if (element instanceof HTMLElement && element !== this.submenu?.parentMenuItem) {
			const node = element.dataValue;
			if (node.submenu) {
				if (!this.popupTimer) {
					this.popupTimer = new Timer({
						duration: delay,
						callback: () => {
							this.popupTimer = null;
							if (element === this.selection) {
								const rect = element.rect();
								let x = rect.right;
								let y = rect.top - 5;
								let width = rect.width + 2;
								if (x + width > window.innerWidth) {
									x = rect.left - width;
								}
								this.submenu?.close();
								this.submenu = new MenuList();
								this.submenu.parentMenuItem = element;
								this.submenu.popup(
									{
										x: x,
										y: y,
										parent: this,
										close: () => {
											this.submenu = null;
										}
									},
									node.submenu
								);
							}
						}
					}).add();
				}
				if (delay === 0) {
					this.popupTimer.finish();
				}
			}
		}
	}

	closeSubmenu(delay: any) {
		const { submenu, selection } = this;
		if (submenu?.parentMenuItem === selection) {
			if (!this.closeTimer) {
				this.closeTimer = new Timer({
					duration: delay,
					callback: () => {
						this.closeTimer = null;
						if (submenu === this.submenu && selection !== this.selection) {
							submenu.close();
						}
					}
				}).add();
			}
		}
	}

	pointerenter(event: any) {
		(this.parent as unknown as MenuList)?.select(this.parentMenuItem);
	}

	static windowBlur(this: MenuList, event: Event) {
		this.close();
	}

	static windowKeydown(this: MenuList, event: KeyboardEvent) {
		if (!this.submenu) {
			event.preventDefault();
			event.stopPropagation();
			switch (event.code) {
				case 'Escape':
					this.close();
					break;
				case 'Enter':
				case 'NumpadEnter':
					if (this.selection) {
						const node = this.selection.dataValue;
						if (node.submenu) {
							this.popupSubmenu(0);
							this.submenu && this.submenu.reselect(1);
						} else {
							node.click && node.click();
							let menu: MenuList | null = this;
							while (menu.parent) {
								menu = menu.parent as MenuList | null;
							}
							menu.close();
						}
					}
					break;
				case 'ArrowUp':
					this.reselect(-1);
					break;
				case 'ArrowDown':
					this.reselect(1);
					break;
				case 'ArrowLeft':
					if (this.parent) {
						this.close();
					}
					break;
				case 'ArrowRight':
					this.popupSubmenu(0);
					this.submenu && this.submenu.reselect(1);
					break;
			}
		}
	}

	// static windowKeyup(event) {

	static windowPointerdown(this: MenuList, event: PointerEvent) {
		const element = (event.target as HTMLElement).seek('menu-list');
		if (
			element instanceof MenuList ||
			((document.activeElement instanceof HTMLInputElement ||
				document.activeElement instanceof HTMLTextAreaElement) &&
				document.activeElement !== event.target &&
				!(
					event.target instanceof HTMLInputElement ||
					event.target instanceof HTMLTextAreaElement
				))
		) {
			event.preventDefault();
		}
		switch (event.button) {
			case 0:
				if (element.tagName !== 'MENU-LIST') {
					this.close();
				} else if (element === this) {
					this.buttonPressed = true;
				}
				break;
			case 2:
				if (element.tagName !== 'MENU-LIST') {
					this.close();
				}
				break;
		}
	}

	static windowPointerup(this: MenuList, event: PointerEvent) {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement;
				switch (element.tagName) {
					case 'MENU-ITEM':
						if (this.buttonPressed) {
							this.buttonPressed = false;
							if (!element.hasClass('disabled')) {
								const node = element.dataValue;
								if (node.submenu) {
									this.popupSubmenu(0);
								} else if (node.click) {
									let root: MenuList | null = this;
									while (root.parent) {
										root = root.parent as MenuList | null;
									}
									node.click();
									root.close();
								}
							}
						}
						break;
					case 'MENU-LIST':
						break;
					default:
						this.close();
						break;
				}
				break;
			}
		}
	}

	static windowPointerover(this: MenuList, event: PointerEvent) {
		const element = event.target as HTMLElement;
		if (
			element !== this.selection &&
			element.parentNode === this &&
			element.tagName === 'MENU-ITEM' &&
			!element.hasClass('disabled')
		) {
			if (this.closeTimer && this.submenu?.parentMenuItem === element) {
				this.closeTimer.remove();
				this.closeTimer = null;
			}
			// 因为逆序更新计时器
			this.closeSubmenu(400);
			this.select(element);
			this.popupSubmenu(400);
		}
	}

	static windowPointerout(this: MenuList, event: PointerEvent) {
		const element = event.target;
		if (this.selection === element) {
			if (this.submenu !== null) {
				this.closeSubmenu(400);
			}
			this.unselect();
		}
	}
}

customElements.define('menu-list', MenuList);

export const Menu = new MenuList();
