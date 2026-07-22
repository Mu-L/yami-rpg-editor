import './element-methods.js';
import { Path } from '../util/config.ts';
import { File } from '../file/file-system-core.ts';
import { CommonList } from './common-list.ts';
import { Menu } from './menu-list.ts';
import { TextBox } from './text-box.ts';
import { Directory } from '../file/directory-object.ts';
import { FS, FSP } from '../file/file-system.ts';
import { Timer } from '../util/timer.ts';

// ******************************** 文件导航面板 ********************************

export class FileNavPane extends HTMLElement {
	declare _connected: boolean;
	timer: any; //:object
	elements: any[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	}; //:array
	selections: any[]; //:array
	pressing: ((event: PointerEvent) => void) | null; //:function
	selectEventEnabled: boolean; //:boolean
	textBox: TextBox; //:element
	links: Record<string, any>; //:object

	constructor() {
		super();

		// 创建重命名计时器
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

		// 设置属性
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

		// 侦听事件
		(this as any).on('scroll', this.resize);
		(this as any).on('keydown', this.keydown);
		(this as any).on('pointerdown', this.pointerdown);
		(this as any).on('pointerup', this.pointerup);
		(this as any).on('doubleclick', this.doubleclick);
		(this as any).on('select', this.listSelect);
		window.on('dirchange', this.dirchange.bind(this));
	}

	// 连接回调：构造期间禁止设置 attribute（如 tabIndex 会反射为 DOM attribute），
	// 因此将需要反射为 DOM 属性的 IDL 属性推迟到接入 DOM 后再设置
	connectedCallback(): void {
		if (!this._connected) {
			this._connected = true;
			this.tabIndex = -1;
		}
	}

	// 加载文件夹
	load(...folders: any[]): void {
		this.select(...folders);
		for (let folder of folders) {
			while ((folder = folder.parent)) {
				folder.getContext(this).expanded = true;
			}
		}
		this.update();
	}

	// 更新列表
	update(): void {
		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		// 创建列表项目
		const { directory } = this.parentNode as any;
		if (directory) {
			this.createItems(directory, 0);
		}

		// 清除多余的元素
		this.clearElements(elements.count);

		// 重新调整
		this.resize();
	}

	// 重新调整
	resize(): void {
		CommonList.resize(this as unknown as CommonList);
	}

	// 更新头部和尾部元素
	updateHeadAndFoot(): void {
		CommonList.updateHeadAndFoot(this as unknown as CommonList);
	}

	// 在重新调整时更新
	updateOnResize(element: any): void {
		if (element.changed) {
			element.changed = false;
			this.updateFolderElement(element);
		}
	}

	// 创建项目
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

	// 创建文件夹元素
	createFolderElement(file: any, indent: number): HTMLElement {
		const context = file.getContext(this);
		let element = context.element;
		if (element === undefined) {
			// 创建文件夹
			element = document.createElement('file-nav-item') as any;
			(element as any).file = file;
			(element as any).context = context;
			context.element = element;

			// 激活选中状态
			const { selections } = this;
			if (selections.length !== 0 && selections.includes(file)) {
				(element as HTMLElement).addClass('selected');
			}
		}
		(element as any).indent = indent;
		(element as any).changed = true;
		return element;
	}

	// 更新文件夹元素
	updateFolderElement(element: any): void {
		const { file, context } = element;
		if (!element.textNode) {
			// 创建折叠标记
			const folderMark = document.createElement('folder-mark');
			element.appendChild(folderMark);

			// 创建文件夹图标
			const fileIcon = document.createElement('file-nav-icon');
			fileIcon.addClass('icon-folder');
			element.appendChild(fileIcon);

			// 创建文本节点
			const textNode = document.createTextNode(file.name);
			element.appendChild(textNode);

			// 设置元素属性
			element.draggable = true;
			element.expanded = false;
			element.markVisible = true;
			element.textIndent = 0;
			element.folderMark = folderMark;
			element.fileIcon = fileIcon;
			element.textNode = textNode;
		}

		// 开关折叠标记
		const markVisible = file.subfolders.length !== 0;
		if (element.markVisible !== markVisible) {
			element.markVisible = markVisible;
			element.folderMark.style.visibility = markVisible
				? 'inherit'
				: 'hidden';
		}

		// 设置折叠标记
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

		// 设置文本缩进
		const textIndent = element.indent * 12;
		if (element.textIndent !== textIndent) {
			element.textIndent = textIndent;
			element.style.textIndent = `${textIndent}px`;
		}
	}

	// 选择项目
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

	// 取消选择
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

	// 选择相对位置的项目
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

	// 滚动到选中项
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
							scrollTop =
								Math.round(
									(i * 20 + 10 - this.innerHeight / 2) / 20
								) * 20;
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

	// 获取选项
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

	// 重命名
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

	// 取消重命名
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

	// 清除元素
	clearElements(start: number): void {
		// 有条件地调整缓存大小
		const { elements } = this;
		if (elements.length > 256 && elements.length !== start) {
			elements.length = start;
		}
		let i = start;
		while (elements[i] !== undefined) {
			elements[i++] = undefined;
		}
	}

	// 清除列表
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

	// 添加事件
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

	// 键盘按下事件
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
					// this.links.body.content.focus()
					// 返回：为了不占用这个按键
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
				// case 'Enter':
				// case 'NumpadEnter': {
				//   const item = this.selection
				//   if (!item || item.children) {
				//     event.stopPropagation()
				//   }
				//   break
				// }
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

	// 指针按下事件
	pointerdown(event: PointerEvent): void {
		this.cancelRenaming();
		switch (event.button) {
			case 0:
			case 2: {
				let element = event.target as HTMLElement;
				if (element.tagName === 'FOLDER-MARK') {
					// 阻止拖拽开始事件
					event.preventDefault();
					if (event.button === 0) {
						const file = (element.parentNode as any).file;
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
							if (!selections.includes((element as any).file)) {
								(files as any).append((element as any).file);
								this.select(...files);
							} else if (length > 1) {
								(files as any).remove((element as any).file);
								const pointerup = (event: PointerEvent) => {
									if (this.pressing === pointerup) {
										this.pressing = null;
										if (
											element.contains(
												event.target as Node
											)
										) {
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
								this.select(
									...slice.map((element: any) => element.file)
								);
								return;
							}
						}
						if (!element.hasClass('selected')) {
							this.select((element as any).file);
						} else if (event.button === 0) {
							if (length > 1) {
								const pointerup = (event: PointerEvent) => {
									if (this.pressing === pointerup) {
										this.pressing = null;
										if (
											element.contains(
												event.target as Node
											)
										) {
											this.select((element as any).file);
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
										(element as any).fileIcon as HTMLElement
									).rect().right
							) {
								this.timer.target = event.target;
							}
						}
					}
				}
				break;
			}
			// case 2: {
			//   const element = event.target.seek('file-nav-item')
			//   if (element.tagName === 'DIR-ITEM' &&
			//     !element.hasClass('selected')) {
			//     this.select(element.file)
			//   }
			//   break
			// }
		}
	}

	// 指针弹起事件
	pointerup(event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (
					document.activeElement === this &&
					this.timer.target === event.target
				) {
					this.timer.running = true;
					this.timer.elapsed = 0;
					this.timer.add();
				}
				break;
		}
	}

	// 鼠标双击事件
	doubleclick(event: Event): void {
		let element = event.target as HTMLElement;
		if (element.tagName === 'FILE-NAV-ICON') {
			element = element.parentNode as HTMLElement;
		}
		if (element.tagName === 'FILE-NAV-ITEM') {
			this.cancelRenaming();
			const folder = (element as any).file;
			if (folder.subfolders.length !== 0) {
				const context = folder.getContext(this);
				context.expanded = !context.expanded;
				this.update();
			}
		}
	}

	// 选择事件
	listSelect(event: Event): void {
		const { browser } = this.links;
		browser.restoreDisplay();
		browser.update();
	}

	// 目录改变事件
	dirchange(event: Event): void {
		const folders: any[] = [];
		const { inoMap } = Directory as any;
		for (const folder of this.getSelections()) {
			const { ino } = folder.stats;
			const { path } = inoMap[ino] || folder;
			(folders as any).append((Directory as any).getFolder(path));
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

	// 静态 - 创建文本输入框
	static textBox = (function IIFE() {
		const textBox = new TextBox();
		textBox.setMaxLength(64);
		(textBox as any).addClass('file-nav-text-box');
		(textBox as any).input.addClass('file-nav-text-box-input');

		// 键盘按下事件
		(textBox as any).on(
			'keydown',
			function (this: HTMLElement, event: KeyboardEvent) {
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
			}
		);

		// 输入前事件
		(textBox as any).on('beforeinput', function (event: any) {
			if (
				event.inputType === 'insertText' &&
				typeof event.data === 'string'
			) {
				const regexp = /[\\/:*?"<>|]/;
				if (regexp.test(event.data)) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		});

		// 输入事件
		(textBox as any).on('input', function (this: TextBox) {
			this.fitContent();
		});

		// 选择事件
		(textBox as any).on('select', function (event: Event) {
			event.stopPropagation();
		});

		// 失去焦点事件
		(textBox as any).on('blur', function (this: TextBox) {
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
