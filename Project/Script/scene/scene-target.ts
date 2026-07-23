import { Timer } from '../util/timer.ts';
import { Easing } from '../data/transition-window.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Scene } from './scene-window.ts';
import { TilemapShortcuts } from './tilemap-shortcut-list.ts';
Scene.setTarget = function (target) {
	if (this.target !== target) {
		if (target !== null && this.tilemap !== null && this.tilemap !== target) {
			this.closeTilemap();
		}
		this.target = target;
		this.updateTargetInfo();
		this.updateTargetItem();
		this.requestRendering();
		if (target) {
			const map = this.inspectorTypeMap;
			const key = map[target.class];
			Inspector.open(key, target);
		} else {
			Inspector.close();
		}
	}
};

// 打开瓦片地图
Scene.openTilemap = function (tilemap) {
	if (tilemap instanceof Object && this.tilemap !== tilemap) {
		this.closeTilemap(false);
		this.tilemap = tilemap;
		this.tilemap.element?.addClass('highlight');
		if (this.tilemap.shortcut !== 0) {
			TilemapShortcuts.elements[this.tilemap.shortcut].addClass('selected');
		}
		this.switchLayer('tilemap');
		this.computeActiveTilemapId();
		this.requestRendering();
		this.marquee.resize();
	}
};

// 关闭瓦片地图
Scene.closeTilemap = function (back = true) {
	if (this.tilemap !== null) {
		this.tilemap.element?.removeClass('highlight');
		if (this.tilemap.shortcut !== 0) {
			TilemapShortcuts.elements[this.tilemap.shortcut].removeClass('selected');
		}
		this.tilemap = null;
		if (back) {
			this.switchLayer('object');
			this.computeActiveTilemapId();
		}
	}
};

// 计算激活的瓦片地图ID
Scene.computeActiveTilemapId = function () {
	const { tilemap } = this;
	switch (tilemap?.layer) {
		case 'background':
			this.activeTilemapId = this.backgrounds.indexOf(tilemap);
			break;
		case 'foreground':
			this.activeTilemapId = this.foregrounds.indexOf(tilemap) | 0x20000;
			break;
		case 'object':
			this.activeTilemapId = this.doodads.indexOf(tilemap) | 0x10000;
			break;
		default:
			this.activeTilemapId = -1;
			break;
	}
};

// 显示目标对象
Scene.revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer) => {
			const { target } = timer;
			if (target === Scene.target) {
				const easing = Easing.EasingMap.easeInOut;
				const time = easing.ease(timer.elapsed / timer.duration);
				const x = timer.startX * (1 - time) + timer.endX * time;
				const y = timer.startY * (1 - time) + timer.endY * time;
				const screen = Scene.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				Scene.updateCamera(x, y);
				Scene.updateTransform();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					Scene.requestRendering();
					Scene.marquee.resize();
					Scene.screen.updateScrollbars();
				}
			} else {
				timer.target = null;
				return false;
			}
		},
		callback: (timer) => {
			timer.target = null;
		}
	});
	return function () {
		const { target, meta } = this;
		const toleranceX = 1 / this.scaledTileWidth / this.scaleX;
		const toleranceY = 1 / this.scaledTileHeight / this.scaleY;
		// 目标和摄像机的位置不一定相等
		if (
			target &&
			!timer.target &&
			(Math.abs(target.x - meta.x) > toleranceX || Math.abs(target.y - meta.y) > toleranceY)
		) {
			timer.target = target;
			timer.startX = meta.x;
			timer.startY = meta.y;
			timer.endX = target.x;
			timer.endY = target.y;
			timer.elapsed = 0;
			timer.add();
		}
	};
})();

// 转移目标对象
Scene.shiftTarget = function (x, y) {
	const target = this.target;
	const map = this.inspectorTypeMap;
	const key = map[target?.class];
	const editor = Inspector[key];
	if (editor !== undefined && (target.x !== x || target.y !== y)) {
		this.planToSave();
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'scene-target-shift';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				x: target.x,
				y: target.y
			});
		}
		target.x = x;
		target.y = y;
		this.updateTargetInfo();
		this.updateTargetEditor();
		this.requestRendering();
	}
};

// 重定向目标对象
Scene.redirectTarget = function (angle) {
	const target = this.target;
	const map = this.inspectorTypeMap;
	const key = map[target?.class];
	const editor = Inspector[key];
	if (editor !== undefined && target.angle !== angle) {
		this.planToSave();
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'scene-target-redirect';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				angle: target.angle
			});
		}
		this.requestRendering();
		target.angle = angle;
		target.player.setAngle(Math.radians(angle));
		if (editor.target === target) {
			editor.write({ angle });
		}
	}
};

// 更新目标对象
Scene.updateTarget = function () {
	let item = this.list.read();
	if (item?.class === 'folder') {
		item = null;
	}
	if (item !== this.target) {
		this.setTarget(item);
	}
};

// 更新目标对象信息
Scene.updateTargetInfo = function () {
	if (this.layer === 'object') {
		switch (this.target?.class) {
			case 'tilemap':
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax': {
				const target = this.target;
				const name = target.name;
				const x = Math.floor(target.x);
				const y = Math.floor(target.y);
				this.info.textContent = `${name} ${x},${y}`;
				break;
			}
			default: {
				const marquee = this.marquee;
				const event = marquee.pointerevent;
				if (event instanceof PointerEvent) {
					const { x, y } = this.getTileCoords(event, true);
					const sw = this.width;
					const sh = this.height;
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (x !== marquee.x || y !== marquee.y || !marquee.visible) {
							marquee.selectInObjectMode(x, y);
						}
					} else {
						marquee.clear();
					}
				} else {
					marquee.clear();
				}
				break;
			}
		}
	}
};

// 更新目标对象列表项
Scene.updateTargetItem = function () {
	const { target } = this;
	if (target !== null) {
		const { list } = this;
		if (list.read() !== target) {
			list.selectWithNoEvent(target);
			if (target) {
				list.expandToSelection();
				list.scrollToSelection();
			}
		}
	}
};

// 更新目标对象编辑器
Scene.updateTargetEditor = function () {
	const target = this.target;
	const map = this.inspectorTypeMap;
	const key = map[target?.class];
	const editor = Inspector[key];
	if (editor !== undefined && editor.target === target) {
		editor.write({
			x: target.x,
			y: target.y
		});
	}
};
