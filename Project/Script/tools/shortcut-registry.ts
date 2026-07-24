// ******************************** 快捷键注册表 ********************************

export const ShortcutRegistry = {
	shortcuts: {},

	register(id: any, handler: any) {
		this.shortcuts[id] = handler;
	},

	get(id: any) {
		return this.shortcuts[id];
	}
};

// 通用快捷键处理器
export const Shortcuts = {
	// 创建剪贴板处理器
	createClipboard(target: any) {
		return function (event) {
			if (event.cmdOrCtrlKey) {
				switch (event.code) {
					case 'KeyC':
						if (target.copy) {
							target.copy();
						}
						return true;
					case 'KeyV':
						if (target.paste) {
							target.paste();
						}
						return true;
					case 'KeyX':
						if (target.cut) {
							target.cut();
						}
						return true;
					case 'KeyD':
						if (target.duplicate) {
							target.duplicate();
						}
						return true;
					case 'KeyA':
						if (target.selectAll) {
							target.selectAll();
						}
						return true;
				}
			}
			return false;
		};
	},

	// 创建撤销/重做处理器
	createUndoRedo(target: any) {
		return function (event) {
			if (event.cmdOrCtrlKey) {
				switch (event.code) {
					case 'KeyZ':
						if (!event.macRedoKey && target.undo) {
							target.undo();
						}
						return true;
					case 'KeyY':
						if (target.redo) {
							target.redo();
						}
						return true;
				}
			}
			return false;
		};
	},

	// 创建列表操作处理器
	createListOps(target: any) {
		return function (event) {
			if (event.cmdOrCtrlKey) {
				switch (event.code) {
					case 'KeyC':
						if (target.copy) {
							target.copy();
						}
						return true;
					case 'KeyV':
						if (target.paste) {
							target.paste();
						}
						return true;
					case 'KeyX':
						if (target.cut) {
							target.cut();
						}
						return true;
					case 'KeyD':
						if (target.duplicate) {
							target.duplicate();
						}
						return true;
					case 'KeyA':
						if (target.selectAll) {
							target.selectAll();
						}
						return true;
					case 'KeyZ':
						if (!event.macRedoKey && target.undo) {
							target.undo();
						}
						return true;
					case 'KeyY':
						if (target.redo) {
							target.redo();
						}
						return true;
				}
			}
			if (event.code === 'Insert') {
				if (target.insert) {
					target.insert();
				}
				return true;
			}
			if (event.code === 'Delete' || event.code === 'Backspace') {
				if (event.cmdOrCtrlKey) {
					if (target.cancelSearch) {
						target.cancelSearch();
					}
				} else if (target.delete) {
					target.delete();
				}
				return true;
			}
			return false;
		};
	},

	// 创建 WASD 滚动处理器
	createScroll(target: any) {
		let scrollKeys = 0;
		let scrollTimer = null;

		function updateScroll() {
			if (scrollKeys === 0) {
				cancelAnimationFrame(scrollTimer);
				scrollTimer = null;
				return;
			}
			let dx = 0;
			let dy = 0;
			if (scrollKeys & 1) dy -= 4;
			if (scrollKeys & 2) dx -= 4;
			if (scrollKeys & 4) dy += 4;
			if (scrollKeys & 8) dx += 4;
			target.scrollBy(dx, dy);
			scrollTimer = requestAnimationFrame(updateScroll);
		}

		return function (event) {
			if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
				return false;
			}
			const key = event.code;
			const down = event.type === 'keydown';
			let bit = 0;
			switch (key) {
				case 'KeyW':
					bit = 1;
					break;
				case 'KeyA':
					bit = 2;
					break;
				case 'KeyS':
					bit = 4;
					break;
				case 'KeyD':
					bit = 8;
					break;
			}
			if (bit === 0) return false;
			if (down) {
				if (!(scrollKeys & bit)) {
					scrollKeys |= bit;
					if (!scrollTimer) {
						scrollTimer = requestAnimationFrame(updateScroll);
					}
				}
			} else {
				scrollKeys &= ~bit;
			}
			return true;
		};
	}
};
