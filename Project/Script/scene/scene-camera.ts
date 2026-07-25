import { $ } from '@/util/dom.ts';
import { Data } from '@/data/data-object.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Scene } from './scene-window.ts';
Scene.setZoom = (function IIFE() {
	const slider = $('#scene-zoom');
	return function (zoom) {
		if (this.zoom !== zoom) {
			let scale;
			switch (zoom) {
				case 0:
					scale = 0.25;
					break;
				case 1:
					scale = 0.5;
					break;
				case 2:
					scale = 1;
					break;
				case 3:
					scale = 2;
					break;
				case 4:
					scale = 4;
					break;
				default:
					return;
			}
			this.zoom = zoom;
			slider.write(zoom);
			if (this.state === 'open') {
				const timer = this.zoomTimer;
				timer.start = this.scale;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

Scene.setSize = function (width, height) {
	if (this.width === width && this.height === height) {
		return;
	}
	this.closeMapRecord();
	this.planToSaveTerrains();
	this.history.save({
		type: 'scene-resize',
		editor: Inspector.fileScene,
		width: this.width,
		height: this.height,
		terrains: this.terrains
	});
	const dTerrains = this.createTerrains(width, height);
	const dro = dTerrains.rowOffset;
	const sTerrains = this.terrains;
	const sro = sTerrains.rowOffset;
	const ex = Math.min(width, this.width);
	const ey = Math.min(height, this.height);
	for (let y = 0; y < ey; y++) {
		for (let x = 0; x < ex; x++) {
			const si = x + y * sro;
			const di = x + y * dro;
			dTerrains[di] = sTerrains[si];
		}
	}
	this.terrains = dTerrains;
	this.width = width;
	this.height = height;
	this.resize();
	this.requestRendering();
};

Scene.setTileSize = function (tileWidth, tileHeight) {
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	this.resize();
	this.requestRendering();
};

Scene.setTilemapSize = function (tilemap, width, height) {
	if (tilemap.width === width && tilemap.height === height) {
		return;
	}
	this.history.save({
		type: 'scene-tilemap-resize',
		editor: Inspector.sceneTilemap,
		tilemap: tilemap,
		width: tilemap.width,
		height: tilemap.height,
		tiles: tilemap.tiles,
		tilesetMap: tilemap.tilesetMap
	});
	const dTiles = this.createTiles(width, height);
	const dro = dTiles.rowOffset;
	const sTiles = tilemap.tiles;
	const sro = sTiles.rowOffset;
	const ex = Math.min(width, tilemap.width);
	const ey = Math.min(height, tilemap.height);
	for (let y = 0; y < ey; y++) {
		for (let x = 0; x < ex; x++) {
			const si = x + y * sro;
			const di = x + y * dro;
			dTiles[di] = sTiles[si];
		}
	}
	tilemap.tiles = dTiles;
	tilemap.width = width;
	tilemap.height = height;
	tilemap.changed = true;
	this.marquee.resize();
};

Scene.resize = function () {
	if (this.state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const scaledPadding = Math.round(this.padding * scale);
		const scaledTileWidth = Math.round(this.tileWidth * scale);
		const scaledTileHeight = Math.round(this.tileHeight * scale);
		const innerWidth = this.width * scaledTileWidth;
		const innerHeight = this.height * scaledTileHeight;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, scaledPadding);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, scaledPadding);
		const paddingRight = Math.max(screenWidth - innerWidth - paddingLeft, scaledPadding);
		const paddingBottom = Math.max(screenHeight - innerHeight - paddingTop, scaledPadding);
		const outerWidth = innerWidth + paddingLeft + paddingRight;
		const outerHeight = innerHeight + paddingTop + paddingBottom;
		const dpr = window.devicePixelRatio;
		this.scaleX = scaledTileWidth / this.tileWidth;
		this.scaleY = scaledTileHeight / this.tileHeight;
		this.scaledTileWidth = scaledTileWidth;
		this.scaledTileHeight = scaledTileHeight;
		this.aspectRatio = scaledTileWidth / scaledTileHeight;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX =
			outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2;
		this.centerOffsetY =
			outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2;
		this.paddingLeft = paddingLeft;
		this.paddingTop = paddingTop;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize(screenWidth, screenHeight);
		GL.resizeLightMap();
		this.updateLightTexParameters();
		this.updateCamera();
		this.updateTransform();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};

Scene.getTileCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (event, integer = false) {
		const coords = event.getRelativeCoords(this.marquee);
		const stw = this.scaledTileWidth;
		const sth = this.scaledTileHeight;
		const dpr = window.devicePixelRatio;
		let sx = coords.x * dpr - this.paddingLeft;
		let sy = coords.y * dpr - this.paddingTop;
		if (this.layer === 'tilemap') {
			const context = this.getGridContext();
			sx -= context.offsetX * this.scaleX;
			sy -= context.offsetY * this.scaleY;
		}
		let x = sx / stw;
		let y = sy / sth;
		if (integer) {
			x = Math.floor(x);
			y = Math.floor(y);
		}
		point.x = x;
		point.y = y;
		return point;
	};
})();

Scene.getConvertedCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return (tile) => {
		point.x = tile.x * Scene.tileWidth;
		point.y = tile.y * Scene.tileHeight;
		return point;
	};
})();

Scene.getParallaxAnchor = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (parallax, tiled = false) {
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const cx = this.scrollCenterX;
		const cy = this.scrollCenterY;
		const px = parallax.x * tw;
		const py = parallax.y * th;
		const fx = parallax.parallaxFactorX;
		const fy = parallax.parallaxFactorY;
		const ax = cx + fx * (px - cx);
		const ay = cy + fy * (py - cy);
		if (tiled) {
			point.x = ax / tw;
			point.y = ay / th;
		} else {
			point.x = ax;
			point.y = ay;
		}
		return point;
	};
})();

Scene.getGridContext = (function IIFE() {
	const context = { width: 0, height: 0, offsetX: 0, offsetY: 0 };
	return function () {
		if (this.layer === 'tilemap') {
			const tilemap = this.tilemap;
			const anchor = this.getParallaxAnchor(tilemap);
			const tw = this.tileWidth;
			const th = this.tileHeight;
			const mw = tilemap.width;
			const mh = tilemap.height;
			const ox = tilemap.offsetX;
			const oy = tilemap.offsetY;
			const ax = tilemap.anchorX * mw * tw;
			const ay = tilemap.anchorY * mh * th;
			context.width = mw;
			context.height = mh;
			context.offsetX = anchor.x - ax + ox;
			context.offsetY = anchor.y - ay + oy;
		} else {
			context.width = this.width;
			context.height = this.height;
			context.offsetX = 0;
			context.offsetY = 0;
		}
		return context;
	};
})();

// 光栅化滚动位置 - 对齐到像素 避免瓦片地图视差模式下图块|网格|选框位置不同步的现象
Scene.rasterizeScrollPosition = (function IIFE() {
	const scroll = { left: 0, top: 0, right: 0, bottom: 0 };
	return function (ox, oy) {
		const sx = this.scaleX;
		const sy = this.scaleY;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		scroll.left = Math.round((sl + ox) * sx) / sx;
		scroll.top = Math.round((st + oy) * sy) / sy;
		scroll.right = scroll.left + sr - sl;
		scroll.bottom = scroll.top + sb - st;
		return scroll;
	};
})();

Scene.updateLightTexParameters = function () {
	const light = Data.config.lightArea;
	const texture = GL.reflectedLightMap;
	const scaleX = this.scaleX;
	const scaleY = this.scaleY;
	if (texture.scaleX !== scaleX || texture.scaleY !== scaleY) {
		texture.scaleX = scaleX;
		texture.scaleY = scaleY;
		const { ceil, min } = Math;
		const pl = texture.paddingLeft;
		const pt = texture.paddingTop;
		const pr = texture.paddingRight;
		const pb = texture.paddingBottom;
		const el = ceil(min(light.expansionLeft * scaleX, pl));
		const et = ceil(min(light.expansionTop * scaleY, pt));
		const er = ceil(min(light.expansionRight * scaleX, pr));
		const eb = ceil(min(light.expansionBottom * scaleY, pb));
		texture.expansionLeft = el / scaleX;
		texture.expansionTop = et / scaleY;
		texture.expansionRight = er / scaleX;
		texture.expansionBottom = eb / scaleY;
		texture.maxExpansionLeft = pl / scaleX;
		texture.maxExpansionTop = pt / scaleY;
		texture.maxExpansionRight = pr / scaleX;
		texture.maxExpansionBottom = pb / scaleY;
		texture.clipX = pl - el;
		texture.clipY = pt - et;
		texture.clipWidth = GL.width + el + er;
		texture.clipHeight = GL.height + et + eb;
	}
};

Scene.updateCamera = function (x = this.meta.x, y = this.meta.y) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaledTileWidth + this.paddingLeft;
	const scrollY = y * this.scaledTileHeight + this.paddingTop;
	const toleranceX = this.scaledTileWidth * 0.0001;
	const toleranceY = this.scaledTileHeight * 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceX) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceY) / dpr;
};

Scene.updateTransform = function () {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = Math.roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4);
	const top = Math.roundTo(screen.scrollTop * dpr - this.paddingTop, 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	const scaleX = this.scaleX;
	const scaleY = this.scaleY;
	const lightmap = GL.reflectedLightMap;
	this.scrollLeft = left / scaleX;
	this.scrollTop = top / scaleY;
	this.scrollRight = right / scaleX;
	this.scrollBottom = bottom / scaleY;
	this.scrollCenterX = (this.scrollLeft + this.scrollRight) / 2;
	this.scrollCenterY = (this.scrollTop + this.scrollBottom) / 2;
	this.lightLeft = this.scrollLeft - lightmap.expansionLeft;
	this.lightTop = this.scrollTop - lightmap.expansionTop;
	this.lightRight = this.scrollRight + lightmap.expansionRight;
	this.lightBottom = this.scrollBottom + lightmap.expansionBottom;
	this.matrix.reset().scale(scaleX, scaleY).translate(-this.scrollLeft, -this.scrollTop);
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY;
	this.meta.x = Math.roundTo((scrollX - this.paddingLeft) / this.scaledTileWidth, 4);
	this.meta.y = Math.roundTo((scrollY - this.paddingTop) / this.scaledTileHeight, 4);
	Data.manifest.changed = true;
};
