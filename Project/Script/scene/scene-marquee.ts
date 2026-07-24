import { Data } from '../data/data-object.ts';
import { Scene } from './scene-window.ts';
// 选框 - 保存状态
Scene.marquee.save = function (key = 'default') {
	let data;
	switch (key) {
		case 'object':
			data = {};
			break;
		case 'tile':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				tiles: this.tiles
			};
			break;
		case 'terrain':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				terrain: this.terrain
			};
			break;
		case 'eraser':
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				tiles: this.tiles,
				terrain: 0b00
			};
			break;
		default:
			data = {
				x: this.x,
				y: this.y,
				width: this.width,
				height: this.height,
				offsetX: this.offsetX,
				offsetY: this.offsetY
			};
			break;
	}
	this.saveData[key] = data;
};

// 选框 - 切换状态
Scene.marquee.switch = function (key) {
	if (this.key !== key) {
		this.save(this.key);
		this.restore((this.key = key));
	}
};

// 选框 - 调整位置
Scene.marquee.resize = function () {
	if (this.pointerevent !== null) {
		Scene.marqueePointermove(this.pointerevent);
	}
};

// 选框 - 擦除矩形
Scene.marquee.clear = function () {
	if (this.visible) {
		this.visible = false;
		Scene.requestRendering();
	}
	if (Scene.info.textContent && !(Scene.layer === 'object' && Scene.target !== null)) {
		Scene.info.textContent = '';
	}
};

// 选框 - 选取矩形
Scene.marquee.select = function (x = this.x, y = this.y, width = this.width, height = this.height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.visible = true;
	Scene.requestRendering();
};

// 选框 - 选取矩形: 橡皮, 铅笔, 填充模式
Scene.marquee.selectInPencilMode = function (x, y, width, height) {
	this.backgroundColor = this.backgroundColorNormal;
	this.borderColor = this.borderColorNormal;
	this.previewTiles = true;
	this.select(x, y, width, height);
	const left = this.x - this.offsetX;
	const top = this.y - this.offsetY;
	Scene.info.textContent = `${left},${top}`;
};

// 选框 - 选取矩形: 矩形, 椭圆模式
Scene.marquee.selectInRectMode = function (x, y, width, height) {
	this.backgroundColor = this.backgroundColorRect;
	this.borderColor = this.borderColorRect;
	this.previewTiles = false;
	this.select(x, y, width, height);
	Scene.info.textContent = `${this.width} x ${this.height}`;
};

// 选框 - 选取矩形: 复制模式
Scene.marquee.selectInCopyMode = function (x, y, width, height) {
	this.backgroundColor = this.backgroundColorCopy;
	this.borderColor = this.borderColorCopy;
	this.previewTiles = false;
	this.select(x, y, width, height);
	Scene.info.textContent = `${this.width} x ${this.height}`;
};

// 选框 - 选取矩形: 对象模式
Scene.marquee.selectInObjectMode = function (x, y) {
	Scene.info.textContent = `${x},${y}`;
};

// 选框 - 获取图块数据
Scene.marquee.getTiles = function (raw) {
	const sTiles = this.tiles;
	if (raw) return sTiles;
	let dTiles = sTiles.standard;
	if (dTiles === undefined) {
		dTiles = sTiles;
		const tilesetMap = this.tilesetMap;
		const tilesets = Data.tilesets;
		const length = sTiles.length;
		for (let i = 0; i < length; i++) {
			let tile = sTiles[i];
			if (tile === 0) continue;
			const guid = tilesetMap[tile >> 24];
			const tileset = tilesets[guid];
			if (tileset?.type === 'auto') {
				if (dTiles === sTiles) {
					dTiles = Scene.cloneTiles(sTiles);
				}
				dTiles[i] = tile & 0xffffffc0;
			}
		}
		sTiles.standard = dTiles;
	}
	return dTiles;
};
