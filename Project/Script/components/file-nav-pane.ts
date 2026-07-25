import './element-methods.js';
import { Path } from '../util/config.ts';
import { File } from '../file/file-system-core.ts';
import { CommonList } from './common-list.ts';
import { Menu } from './menu-list.ts';
import { TextBox } from './text-box.ts';
import { Directory } from '../file/directory-object.ts';
import { FS, FSP } from '../file/file-system.ts';
import { Timer } from '../util/timer.ts';
import { FileBrowserLinks } from '../types/file-browser-links.ts';

export class FileNavPane extends HTMLElement {
	declare _connected: boolean;
	timer: any;
	elements: any[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selections: any[];
	pressing: ((event: PointerEvent) => void) | null;
	selectEventEnabled: boolean;
	textBox: TextBox;
	links: FileBrowserLinks;

	constructor() {
		super();

		const timer = new Timer({
			duration: 500,
			callback: (timer: any) => {
				const files = this.selections;
				if (files.length === 1) {
					const file = files[0];
					const target = timer.target;
					const context = file.getContext(this);
					const element = context.element;
					if (element && element.contains(target)) {
						this.rename(file);
					}
				}
				timer.target = null;
				timer.running = false;
			}
		});

		this.timer = timer;
		this.elements = [] as any;
		this.elements.versionId = 0;
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.elements.head = null;
		this.elements.foot = null;
		this.selections = [];
		this.pressing = null;
		this.selectEventEnabled = false;
		this.textBox = FileNavPane.textBox;
		this.listenDraggingScrollbarEvent();

		this.on('scroll', this.resize);
		this.on('keydown', this.keydown);
		this.on('pointerdown', this.pointerdown);
		this.on('pointerup', this.pointerup);
		this.on('doubleclick', this.doubleclick);
		this.on('select', this.listSelect);
		window.on('dirchange', this.dirchange.bind(this));
	}

	// 因此将需要反射为 DOM 属性的 IDL 属性推迟到接入 DOM 后再设置
	connectedCallback(): void {
		if (!this._connected) {
			this._connected = true;
			this.tabIndex = -1;
		}
	}

	load(...folders: any[]): void {
		this.select(...folders);
		for (let folder of folders) {
			while ((folder = folder.parent)) {
				folder.getContext(this).expanded = true;
			}
		}
		this.update();
	}

	update(): void {
		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		const { directory } = this.parentNode as HTMLElement & {
			directory: string;
		};
		if (directory) {
			this.createItems(directory, 0);
		}

		this.clearElements(elements.count);

		this.resize();
	}

	resize(): void {
		CommonList.resize(this as unknown as CommonList);
	}

	updateHeadAndFoot(): void {
		CommonList.updateHeadAndFoot(this as unknown as CommonList);
	}

	updateOnResize(element: any): void {
		if (element.changed) {
			element.changed = false;
			this.updateFolderElement(element);
		}
	}

	createItems(dir: any, indent: number): void {
		if (dir.sorted === undefined) {
			dir.sorted = true;
			(Directory as any).sortFiles(dir);
		}
		const elements = this.elements;
		const length = dir.length;
		for (let i = 0; i < length; i++) {
			const file = dir[i];
			elements[elements.count++] = this.createFolderElement(file, indent);
			const context = file.getContext(this);
			if (context.expanded && file.subfolders) {
				this.createItems(file.subfolders, indent + 1);
			}
		}
	}

	createFolderElement(file: any, indent: number): HTMLElement {
		const context = file.getContext(this);
		let element = context.element;
		if (element === undefined) {
			element = document.createElement('file-nav-item') as unknown as HTMLElement & {
				file: any;
				context: any;
				indent: number;
				changed?: boolean;
				fileIcon?: HTMLElement;
			};
			(
				element as HTMLElement & {
					file: any;
					context: any;
					indent: number;
					changed?: boolean;
					fileIcon?: HTMLElement;
				}
			).file = file;
			(
				element as HTMLElement & {
					file: any;
					context: any;
					indent: number;
					changed?: boolean;
					fileIcon?: HTMLElement;
				}
			).context = context;
			context.element = element;

			const { selections } = this;
			if (selections.length !== 0 && selections.includes(file)) {
				(element as HTMLElement).addClass('selected');
			}
		}
		(element as HTMLElement & { indent: number; changed?: boolean }).indent = indent;
		(element as HTMLElement & { indent: number; changed?: boolean }).changed = true;
		return element;
	}

	updateFolderElement(element: any): void {
		const { file, context } = element;
		if (!element.textNode) {
			const folderMark = document.createElement('folder-mark');
			element.appendChild(folderMark);

			const fileIcon = document.createElement('file-nav-icon');
			fileIcon.addClass('icon-folder');
			element.appendChild(fileIcon);

			const textNode = document.createTextNode(file.name);
			element.appendChild(textNode);

			element.draggable = true;
			element.expanded = false;
			element.markVisible = true;
			element.textIndent = 0;
			element.folderMark = folderMark;
			element.fileIcon = fileIcon;
			element.textNode = textNode;
		}

		const markVisible = file.subfolders.length !== 0;
		if (element.markVisible !== markVisible) {
			element.markVisible = markVisible;
			element.folderMark.style.visibility = markVisible ? 'inherit' : 'hidden';
		}

		const expanded = markVisible && context.expanded;
		if (element.expanded !== expanded) {
			element.expanded = expanded;
			switch (expanded) {
				case true:
					element.folderMark.addClass('expanded');
					element.fileIcon.addClass('expanded');
					break;
				case false:
					element.folderMark.removeClass('expanded');
					element.fileIcon.removeClass('expanded');
					break;
			}
		}

		const textIndent = element.indent * 12;
		if (element.textIndent !== textIndent) {
			element.textIndent = textIndent;
			element.style.textIndent = `${textIndent}px`;
		}
	}

	select(...files: any[]): void {
		this.unselect();
		this.selections = files;
		for (const file of files) {
			const context = file.getContext(this);
			const element = context.element;
			if (element !== undefined) {
				element.addClass('selected');
			}
		}
		if (this.selectEventEnabled) {
			const select: any = new Event('select');
			select.value = files;
			this.dispatchEvent(select);
		}
	}

	unselect(): void {
		const files = this.selections;
		if (files.length !== 0) {
			FileNavPane.textBox.input.blur();
			for (const file of files) {
				const context = file.getContext(this);
				const element = context.element;
				if (element !== undefined) {
					element.removeClass('selected');
				}
			}
			this.selections = [];
		}
	}

	selectRelative(direction: 'up' | 'down'): void {
		const elements = this.elements;
		const count = elements.count;
		if (count > 0) {
			let index: number;
			let start = Infinity;
			let end = -Infinity;
			const last = count - 1;
			const { selections } = this;
			for (const file of selections) {
				const { element } = file.getContext(this);
				const index = elements.indexOf(element);
				if (index !== -1) {
					start = Math.min(start, index);
					end = Math.max(end, index);
				}
			}
			switch (direction) {
				case 'up':
					index = Math.clamp(start - 1, 0, last);
					break;
				case 'down':
					index = Math.clamp(end + 1, 0, last);
					break;
			}
			const file = elements[index]?.file;
			if (!(selections.length === 1 && selections[0] === file)) {
				this.select(file);
			}
			this.scrollToSelection();
		}
	}

	scrollToSelection(mode: string = 'active'): void {
		const { selections } = this;
		if (selections.length === 1 && (this as any).hasScrollBar()) {
			const selection = selections[0];
			const elements = this.elements;
			const count = elements.count;
			for (let i = 0; i < count; i++) {
				if (elements[i].file === selection) {
					let scrollTop: number;
					switch (mode) {
						case 'active':
							scrollTop = Math.clamp(
								this.scrollTop,
								i * 20 + 20 - this.innerHeight,
								i * 20
							);
							break;
						case 'middle':
							scrollTop = Math.round((i * 20 + 10 - this.innerHeight / 2) / 20) * 20;
							break;
						default:
							return;
					}
					if (this.scrollTop !== scrollTop) {
						this.scrollTop = scrollTop;
					}
					break;
				}
			}
		}
	}

	getSelections(): any[] {
		const { browser } = this.links;
		switch (browser.display) {
			case 'normal':
				return this.selections;
			case 'search':
				return browser.backupFolders;
		}
		return [];
	}

	rename(file: any): void {
		const { textBox } = FileNavPane;
		if (
			document.activeElement === this &&
			file !== (Directory as any).assets &&
			!textBox.parentNode
		) {
			const context = file.getContext(this);
			const element = context.element;
			if (element && element.parentNode) {
				element.textNode.nodeValue = '';
				element.appendChild(textBox as any);
				textBox.write(file.name);
				textBox.getFocus('all');
				textBox.fitContent();
			}
		}
	}

	cancelRenaming(): void {
		const { timer } = this;
		if (timer.target) {
			timer.target = null;
		}
		if (timer.running) {
			timer.running = false;
			timer.remove();
		}
	}

	clearElements(start: number): void {
		const { elements } = this;
		if (elements.length > 256 && elements.length !== start) {
			elements.length = start;
		}
		let i = start;
		while (elements[i] !== undefined) {
			elements[i++] = undefined;
		}
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
			case 'select':
				this.selectEventEnabled = true;
				break;
		}
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
				default:
					return;
			}
			event.stopImmediatePropagation();
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'Space':
					event.preventDefault();
					// this.links.body.content.focus() 返回：为了不占用这个按键
					return;
				case 'ArrowRight': {
					event.preventDefault();
					const files = this.selections;
					if (files.length === 1) {
						const file = files[0];
						if (file.subfolders.length !== 0) {
							const context = file.getContext(this);
							context.expanded = !context.expanded;
							this.update();
						}
					}
					break;
				}
				// const item = this.selection if (!item || item.children) {
				case 'ArrowUp':
					event.preventDefault();
					this.selectRelative('up');
					break;
				case 'ArrowDown':
					event.preventDefault();
					this.selectRelative('down');
					break;
				case 'F2': {
					const files = this.selections;
					if (files.length === 1) {
						this.cancelRenaming();
						this.rename(files[0]);
					}
					break;
				}
				default:
					return;
			}
			event.stopImmediatePropagation();
		}
	}

	pointerdown(event: PointerEvent): void {
		this.cancelRenaming();
		switch (event.button) {
			case 0:
			case 2: {
				let element = event.target as HTMLElement;
				if (element.tagName === 'FOLDER-MARK') {
					event.preventDefault();
					if (event.button === 0) {
						const file = (element.parentNode as HTMLElement & { file: any }).file;
						const context = file.getContext(this);
						context.expanded = !context.expanded;
						this.update();
					}
				} else {
					if (element.tagName === 'FILE-NAV-ICON') {
						element = element.parentNode as HTMLElement;
					}
					if (element.tagName === 'FILE-NAV-ITEM') {
						const selections = this.selections;
						const length = selections.length;
						if (event.cmdOrCtrlKey && length !== 0) {
							const files = Array.from(selections);
							if (
								!selections.includes((element as HTMLElement & { file: any }).file)
							) {
								(
									files as unknown as any[] & {
										append(...args: any[]): void;
									}
								).append((element as HTMLElement & { file: any }).file);
								this.select(...files);
							} else if (length > 1) {
								(
									files as unknown as any[] & {
										remove(...args: any[]): void;
									}
								).remove((element as HTMLElement & { file: any }).file);
								const pointerup = (event: PointerEvent) => {
									if (this.pressing === pointerup) {
										this.pressing = null;
										if (element.contains(event.target as Node)) {
											this.select(...files);
										}
									}
								};
								this.pressing = pointerup;
								window.on('pointerup', pointerup, {
									once: true
								});
							}
							return;
						}
						if (event.shiftKey && length !== 0) {
							const elements = this.elements;
							let start = elements.indexOf(element);
							let end = start;
							for (const file of selections) {
								const { element } = file.getContext(this);
								const index = elements.indexOf(element);
								if (index !== -1) {
									start = Math.min(start, index);
									end = Math.max(end, index);
								}
							}
							if (start !== -1) {
								const slice = elements.slice(start, end + 1);
								this.select(...slice.map((element: any) => element.file));
								return;
							}
						}
						if (!element.hasClass('selected')) {
							this.select((element as HTMLElement & { file: any }).file);
						} else if (event.button === 0) {
							if (length > 1) {
								const pointerup = (event: PointerEvent) => {
									if (this.pressing === pointerup) {
										this.pressing = null;
										if (element.contains(event.target as Node)) {
											this.select(
												(
													element as HTMLElement & {
														file: any;
													}
												).file
											);
										}
									}
								};
								this.pressing = pointerup;
								window.on('pointerup', pointerup, {
									once: true
								});
							} else if (
								(Menu as any).state === 'closed' &&
								document.activeElement === this &&
								event.clientX >
									(
										(
											element as HTMLElement & {
												fileIcon?: HTMLElement;
											}
										).fileIcon as HTMLElement
									).rect().right
							) {
								this.timer.target = event.target;
							}
						}
					}
				}
				break;
			}
			// const element = event.target.seek('file-nav-item') if (element.tagName === 'DIR-ITEM' && !element.hasClass('selected')) {
		}
	}

	pointerup(event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (document.activeElement === this && this.timer.target === event.target) {
					this.timer.running = true;
					this.timer.elapsed = 0;
					this.timer.add();
				}
				break;
		}
	}

	doubleclick(event: Event): void {
		let element = event.target as HTMLElement;
		if (element.tagName === 'FILE-NAV-ICON') {
			element = element.parentNode as HTMLElement;
		}
		if (element.tagName === 'FILE-NAV-ITEM') {
			this.cancelRenaming();
			const folder = (element as HTMLElement & { file: any }).file;
			if (folder.subfolders.length !== 0) {
				const context = folder.getContext(this);
				context.expanded = !context.expanded;
				this.update();
			}
		}
	}

	listSelect(event: Event): void {
		const { browser } = this.links;
		browser.restoreDisplay();
		browser.update();
	}

	dirchange(event: Event): void {
		const folders: any[] = [];
		const { inoMap } = Directory as any;
		for (const folder of this.getSelections()) {
			const { ino } = folder.stats;
			const { path } = inoMap[ino] || folder;
			(folders as unknown as any[] & { append(...args: any[]): void }).append(
				(Directory as unknown as { getFolder(path: string): any }).getFolder(path)
			);
		}
		const { browser } = this.links;
		switch (browser.display) {
			case 'normal':
				this.unselect();
				this.load(...folders);
				break;
			case 'search':
				this.update();
				break;
		}
	}

	static textBox = (function IIFE() {
		const textBox = new TextBox();
		textBox.setMaxLength(64);
		(textBox as any).addClass('file-nav-text-box');
		(textBox as any).input.addClass('file-nav-text-box-input');

		textBox.on('keydown', function (this: HTMLElement, event: KeyboardEvent) {
			event.stopPropagation();
			switch (event.code) {
				case 'Enter':
				case 'NumpadEnter':
				case 'Escape': {
					const item = this.parentNode as any;
					const nav = item.parentNode as HTMLElement;
					(textBox as any).input.blur();
					nav.focus();
					break;
				}
			}
		});

		textBox.on('beforeinput', function (event: any) {
			if (event.inputType === 'insertText' && typeof event.data === 'string') {
				const regexp = /[\\/:*?"<>|]/;
				if (regexp.test(event.data)) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		});

		textBox.on('input', function (this: TextBox) {
			this.fitContent();
		});

		textBox.on('select', function (event: Event) {
			event.stopPropagation();
		});

		textBox.on('blur', function (this: TextBox) {
			const item = this.parentNode as any;
			const file = item.file;
			const name = this.read().trim();
			this.remove();
			if (name && name !== file.name) {
				const dir = Path.dirname(file.path);
				const path = File.path(`${dir}/${name}`);
				if (!FS.existsSync(path)) {
					return FSP.rename(File.path(file.path), path)
						.then(() => {
							return (Directory as any).update();
						})
						.then((changed: boolean) => {
							if (!changed) {
								throw new Error();
							}
						})
						.catch((error: any) => {
							item.textNode.nodeValue = file.name;
						});
				}
			}
			item.textNode.nodeValue = file.name;
		});

		return textBox;
	})();
}

customElements.define('file-nav-pane', FileNavPane);
