import { INTRGBA } from '@/util/color-utils.ts';
import { Data } from '@/data/data-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Palette } from '@/palette/palette.ts';
import { Scene } from './scene-window.ts';
import { ImageTexture } from '@/webgl/image-texture.ts';
import { Matrix } from '@/webgl/matrix2.ts';
import { Texture } from '@/webgl/texture.ts';
import { GL } from '@/webgl/webgl-init.ts';

Scene.drawScene = function () {
	if (GL.width * GL.height === 0) {
		return;
	}
	switch (this.layer) {
		case 'object':
			this.drawLightTextures();
			this.drawBackgrounds();
			this.drawRegionLayer();
			this.drawStartPosition();
			this.drawGridLayer();
			this.drawAnimationWireframe();
			this.drawObjectLayer();
			this.drawDirectLightLayer();
			this.drawForegrounds();
			this.drawRegionBorders();
			this.drawRegionWireframe();
			this.drawLightWireframe();
			this.drawAnimationAnchor();
			this.drawParticleEmitterWireframe();
			this.drawTilemapWireframe();
			this.drawParallaxWireframe();
			this.drawNameLayer();
			break;
		case 'tilemap':
			this.drawLightTextures();
			this.drawBackgrounds();
			this.drawObjectLayer();
			this.drawDirectLightLayer();
			this.drawForegrounds();
			GL.alpha = 0.25;
			this.drawTilePreview();
			GL.alpha = 1;
			this.drawGridLayer();
			this.drawTileMarquee();
			break;
		case 'terrain':
			this.drawLightTextures();
			this.drawBackgrounds();
			this.drawObjectLayer();
			this.drawDirectLightLayer();
			this.drawForegrounds();
			this.drawGridLayer();
			this.drawTerrainLayer();
			this.drawTerrainMarquee();
			break;
	}
};

Scene.drawBackgrounds = function () {
	GL.clearColor(...this.background.getGLRGBA());
	GL.clear(GL.COLOR_BUFFER_BIT);
	const activeId = this.activeTilemapId;
	const backgrounds = this.backgrounds;
	const length = backgrounds.length;
	for (let i = 0; i < length; i++) {
		const object = backgrounds[i];
		if (object.hidden && i !== activeId) {
			continue;
		}
		switch (object.class) {
			case 'parallax':
				object.player.draw(i);
				continue;
			case 'tilemap':
				this.drawTilemap(object, i);
				continue;
		}
	}
	GL.alpha = 1;
};

Scene.drawForegrounds = function () {
	const activeId = this.activeTilemapId;
	const foregrounds = this.foregrounds;
	const length = foregrounds.length;
	for (let i = 0; i < length; i++) {
		const object = foregrounds[i];
		const id = i | 0x20000;
		if (object.hidden && id !== activeId) {
			continue;
		}
		switch (object.class) {
			case 'parallax':
				object.player.draw(id);
				continue;
			case 'tilemap':
				this.drawTilemap(object, id);
				continue;
		}
	}
	GL.alpha = 1;
};

Scene.updateAnimations = function (deltaTime) {
	const lightmap = GL.reflectedLightMap;
	const area = Data.config.animationArea;
	const th = this.tileHeight;
	const sl = this.scrollLeft - area.expansionLeft;
	const st = this.scrollTop - area.expansionTop;
	const sr = this.scrollRight + area.expansionRight;
	const sb = this.scrollBottom + area.expansionBottom;
	const ll = this.scrollLeft - lightmap.maxExpansionLeft;
	const lt = this.scrollTop - lightmap.maxExpansionTop;
	const lr = this.scrollRight + lightmap.maxExpansionRight;
	const lb = this.scrollBottom + lightmap.maxExpansionBottom;
	const lw = lr - ll;
	const lh = lb - lt;
	const pFactor = th / lh;
	const { showAnimation } = this;
	const { actors, animations } = this;
	for (let i = 0; i < 2; i++) {
		const list = i === 0 ? actors : animations;
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const object = list[i];
			if (object.hidden) continue;
			const player = object.player;
			if (player.motion !== null) {
				player.update(deltaTime);
				const { x, y } = this.getConvertedCoords(object);
				if (x >= sl && x < sr && y >= st && y < sb) {
					const priority = (object.priority ?? object.data?.priority ?? 0) * pFactor;
					player.setPosition(x, y);
					player.updateFrameParameters(player.contexts, player.index);
					player.anchorX = (x - ll) / lw;
					player.anchorY = (y - lt) / lh + priority;
					player.visible = true;
					if (showAnimation) {
						player.emitParticles(deltaTime);
						player.updateParticles(deltaTime);
					}
				} else {
					player.visible = false;
					// 粒子发射器的更新可以独立出来运行来减少这种计算
					if (
						showAnimation &&
						player.emitters.length !== 0 &&
						player.updateParticles(deltaTime) !== 0
					) {
						player.visible = true;
					}
				}
			}
		}
	}
};

Scene.updateParticles = function (deltaTime) {
	if (this.showAnimation) {
		const lightmap = GL.reflectedLightMap;
		const area = Data.config.animationArea;
		const th = this.tileHeight;
		const al = this.scrollLeft - area.expansionLeft;
		const at = this.scrollTop - area.expansionTop;
		const ar = this.scrollRight + area.expansionRight;
		const ab = this.scrollBottom + area.expansionBottom;
		const lt = this.scrollTop - lightmap.maxExpansionTop;
		const lh = this.scrollBottom + lightmap.maxExpansionBottom - lt;
		const pFactor = th / lh;
		const particles = this.particles;
		const length = particles.length;
		for (let i = 0; i < length; i++) {
			const particle = particles[i];
			if (particle.hidden) continue;
			const emitter = particle.emitter;
			if (emitter === undefined) continue;
			const { x, y } = this.getConvertedCoords(particle);
			// 如果粒子发射器在屏幕中可见，或始终发射
			if ((x >= al && x < ar && y >= at && y < ab) || emitter.alwaysEmit) {
				const priority = particle.priority * pFactor;
				emitter.anchorY = (y - lt) / lh + priority;
				emitter.startX = x;
				emitter.startY = y;
				emitter.emitParticles(deltaTime);
				emitter.updateParticles(deltaTime);
				emitter.visible = true;
			} else {
				emitter.updateParticles(deltaTime);
				emitter.visible = false;
			}
		}
	}
};

Scene.drawTilemap = function (tilemap, id) {
	let layer, opacity;
	const activeId = this.activeTilemapId;
	if (activeId === -1 || id === activeId) {
		layer = 'upper';
		opacity = 1;
	} else if (id < activeId) {
		layer = 'lower';
		opacity = 1;
	} else if (id > activeId) {
		layer = 'upper';
		opacity = 0.25;
	}
	const anchor = this.getParallaxAnchor(tilemap);
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const pw = tilemap.width * tw;
	const ph = tilemap.height * th;
	const ax = tilemap.anchorX * pw;
	const ay = tilemap.anchorY * ph;
	const ox = anchor.x - ax + tilemap.offsetX;
	const oy = anchor.y - ay + tilemap.offsetY;
	return this.drawTileLayer(
		layer,
		tilemap.light,
		tilemap.blend,
		tilemap.opacity * opacity * (tilemap.enabled ? 1 : 0.3),
		tilemap.tilesetMap,
		tilemap.tiles,
		ox,
		oy
	);
};

Scene.drawTilePreview = function () {
	const marquee = this.marquee;
	if (marquee.visible && marquee.previewTiles) {
		const mm = marquee.tilesetMap;
		const mt = marquee.tiles;
		const coords = this.getConvertedCoords(marquee);
		let ox = coords.x;
		let oy = coords.y;
		if (this.layer === 'tilemap') {
			const context = this.getGridContext();
			ox += context.offsetX;
			oy += context.offsetY;
		}
		this.drawTileLayer('upper', 'global', 'normal', 0.6, mm, mt, ox, oy);
		GL.alpha = 1;
	}
};

Scene.drawTileLayer = function (layer, light, blend, opacity, tilesetMap, tiles, ox, oy) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const push = gl.batchRenderer.push;
	const response = gl.batchRenderer.response;
	const textures = this.textures;
	const width = tiles.width;
	const height = tiles.height;
	const tro = tiles.rowOffset;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const tilesets = Data.tilesets;
	const templates = Data.autotiles.map;
	const scroll = this.rasterizeScrollPosition(-ox, -oy);
	const sl = scroll.left;
	const st = scroll.top;
	const sr = scroll.right;
	const sb = scroll.bottom;
	const area = Data.config.tileArea;
	const tl = sl - area.expansionLeft;
	const tt = st - area.expansionTop;
	const tr = sr + area.expansionRight;
	const tb = sb + area.expansionBottom;
	const bx = Math.max(Math.floor(tl / tw), 0);
	const by = Math.max(Math.floor(tt / th), 0);
	const ex = Math.min(Math.ceil(tr / tw), width);
	const ey = Math.min(Math.ceil(tb / th), height);
	gl.batchRenderer.setAttrSize(0);
	gl.batchRenderer.setBlendMode(blend);
	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			const tile = tiles[i];
			if (tile !== 0) {
				const guid = tilesetMap[tile >> 24];
				const tileset = tilesets[guid];
				if (tileset !== undefined) {
					switch (tileset.type) {
						case 'normal': {
							const texture = textures[tileset.image];
							if (texture instanceof ImageTexture) {
								push(texture.base.index);
								const sw = tileset.tileWidth;
								const sh = tileset.tileHeight;
								const sx = ((tile >> 8) & 0xff) * sw;
								const sy = ((tile >> 16) & 0xff) * sh;
								const dl = x * tw + (tw - sw) / 2 + tileset.globalOffsetX;
								const dt = y * th + (th - sh) + tileset.globalOffsetY;
								const dr = dl + sw;
								const db = dt + sh;
								let sl = (sx + 0.002) / texture.width;
								let sr = (sx + sw - 0.002) / texture.width;
								if (tile & 0b1) {
									const temporary = sl;
									sl = sr;
									sr = temporary;
								}
								const st = (sy + 0.002) / texture.height;
								const sb = (sy + sh - 0.002) / texture.height;
								const vi = response[0] * 5;
								const si = response[1];
								vertices[vi] = dl;
								vertices[vi + 1] = dt;
								vertices[vi + 2] = sl;
								vertices[vi + 3] = st;
								vertices[vi + 4] = si;
								vertices[vi + 5] = dl;
								vertices[vi + 6] = db;
								vertices[vi + 7] = sl;
								vertices[vi + 8] = sb;
								vertices[vi + 9] = si;
								vertices[vi + 10] = dr;
								vertices[vi + 11] = db;
								vertices[vi + 12] = sr;
								vertices[vi + 13] = sb;
								vertices[vi + 14] = si;
								vertices[vi + 15] = dr;
								vertices[vi + 16] = dt;
								vertices[vi + 17] = sr;
								vertices[vi + 18] = st;
								vertices[vi + 19] = si;
							} else if (texture === undefined) {
								const guid = tileset.image;
								const image = Palette.images[guid];
								if (image instanceof Image) {
									textures.append(new ImageTexture(image));
									x--;
								} else {
									textures.load(guid);
								}
							}
							break;
						}
						case 'auto': {
							const tx = (tile >> 8) & 0xff;
							const ty = (tile >> 16) & 0xff;
							const id = tx + ty * tileset.width;
							const autoTile = tileset.tiles[id];
							if (!autoTile) {
								continue;
							}
							const template = templates[autoTile.template];
							if (template === undefined) {
								continue;
							}
							const nodeId = tile & 0b111111;
							const node = template.nodes[nodeId];
							if (node === undefined) {
								continue;
							}
							const texture = textures[autoTile.image];
							if (texture instanceof ImageTexture) {
								push(texture.base.index);
								const index = this.animationFrame % node.frames.length;
								const frame = node.frames[index];
								const sw = tileset.tileWidth;
								const sh = tileset.tileHeight;
								const sx = (autoTile.x + (frame & 0xff)) * sw;
								const sy = (autoTile.y + (frame >> 8)) * sh;
								const dl = x * tw + (tw - sw) / 2 + tileset.globalOffsetX;
								const dt = y * th + (th - sh) + tileset.globalOffsetY;
								const dr = dl + sw;
								const db = dt + sh;
								const sl = (sx + 0.002) / texture.width;
								const st = (sy + 0.002) / texture.height;
								const sr = (sx + sw - 0.002) / texture.width;
								const sb = (sy + sh - 0.002) / texture.height;
								const vi = response[0] * 5;
								const si = response[1];
								vertices[vi] = dl;
								vertices[vi + 1] = dt;
								vertices[vi + 2] = sl;
								vertices[vi + 3] = st;
								vertices[vi + 4] = si;
								vertices[vi + 5] = dl;
								vertices[vi + 6] = db;
								vertices[vi + 7] = sl;
								vertices[vi + 8] = sb;
								vertices[vi + 9] = si;
								vertices[vi + 10] = dr;
								vertices[vi + 11] = db;
								vertices[vi + 12] = sr;
								vertices[vi + 13] = sb;
								vertices[vi + 14] = si;
								vertices[vi + 15] = dr;
								vertices[vi + 16] = dt;
								vertices[vi + 17] = sr;
								vertices[vi + 18] = st;
								vertices[vi + 19] = si;
							} else if (texture === undefined) {
								const guid = autoTile.image;
								const image = Palette.images[guid];
								if (image instanceof Image) {
									textures.append(new ImageTexture(image));
									x--;
								} else {
									textures.load(guid);
								}
							}
							break;
						}
					}
				}
			}
		}
	}
	const endIndex = gl.batchRenderer.getEndIndex();
	if (endIndex !== 0) {
		gl.alpha = opacity;
		const program = gl.tileProgram.use();
		const modeMap = this.tilemapLightSamplingModes;
		const lightMode = this.showLight ? light : 'raw';
		const lightModeIndex = modeMap[lightMode];
		const matrix = gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
		switch (layer) {
			case 'upper':
				gl.uniform1i(program.u_TintMode, 0);
				break;
			case 'lower':
				gl.uniform1i(program.u_TintMode, 1);
				gl.uniform4f(program.u_Tint, -0.2, -0.2, -0.2, 0.8);
				break;
		}
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform1i(program.u_LightMode, lightModeIndex);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, endIndex * 5);
		gl.batchRenderer.draw();
	}
};

Scene.drawGridLayer = function () {
	if (this.showGrid && this.width * this.height) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const context = this.getGridContext();
		const width = context.width;
		const height = context.height;
		const sx = context.offsetX;
		const sy = context.offsetY;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const scroll = this.rasterizeScrollPosition(-sx, -sy);
		const sl = scroll.left;
		const st = scroll.top;
		const sr = scroll.right;
		const sb = scroll.bottom;
		const ox = 0.5 / this.scaleX / tw;
		const oy = 0.5 / this.scaleY / th;
		const bx = Math.max(Math.ceil(sl / tw), 0);
		const by = Math.max(Math.ceil(st / th), 0);
		const ex = Math.min(Math.ceil(sr / tw), width + 1);
		const ey = Math.min(Math.ceil(sb / th), height + 1);
		const left = Math.max(Math.floor(sl / tw), 0);
		const top = Math.max(Math.floor(st / th), 0);
		const right = Math.min(ex, width + 1 / this.scaleX / tw);
		const bottom = Math.min(ey, height + 1 / this.scaleY / th);
		let vi = 0;
		for (let y = by; y < ey; y++) {
			vertices[vi] = left;
			vertices[vi + 1] = y + oy;
			vertices[vi + 2] = right;
			vertices[vi + 3] = y + oy;
			vi += 4;
		}
		for (let x = bx; x < ex; x++) {
			vertices[vi] = x + ox;
			vertices[vi + 1] = top;
			vertices[vi + 2] = x + ox;
			vertices[vi + 3] = bottom;
			vi += 4;
		}
		if (vi !== 0) {
			const program = gl.graphicProgram.use();
			gl.matrix
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.scale(tw, th);
			gl.bindVertexArray(program.vao.a10);
			gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
			gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 0.5);
			gl.drawArrays(gl.LINES, 0, vi / 2);
		}
	}
};

Scene.drawRegionLayer = function () {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const colors = gl.arrays[0].uint32;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const regions = this.regions;
	const length = regions.length;
	const list = regions.visibleList;
	let li = 0;
	let vi = 0;
	for (let i = 0; i < length; i++) {
		const region = regions[i];
		if (region.hidden) continue;
		const rx = region.x;
		const ry = region.y;
		const rw = region.width;
		const rh = region.height;
		const rl = rx - rw / 2;
		const rt = ry - rh / 2;
		const rr = rl + rw;
		const rb = rt + rh;
		const ml = rl * tw;
		const mt = rt * th;
		const mr = rr * tw;
		const mb = rb * th;
		if (ml < sr && mt < sb && mr > sl && mb > st) {
			const hex = region.color;
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) * (region.enabled ? 1 : 0.5);
			const rgba = r | (g << 8) | (b << 16) | (a << 24);
			list[li++] = region;
			vertices[vi] = rl;
			vertices[vi + 1] = rt;
			colors[vi + 2] = rgba;
			vertices[vi + 3] = rl;
			vertices[vi + 4] = rb;
			colors[vi + 5] = rgba;
			vertices[vi + 6] = rr;
			vertices[vi + 7] = rb;
			colors[vi + 8] = rgba;
			vertices[vi + 9] = rr;
			vertices[vi + 10] = rt;
			colors[vi + 11] = rgba;
			vi += 12;
		}
	}

	const count = list.count;
	for (let i = li; i < count; i++) {
		list[i] = undefined;
	}
	list.count = li;

	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.drawElements(gl.TRIANGLES, vi / 2, gl.UNSIGNED_INT, 0);
	}
};

Scene.drawRegionBorders = function () {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const ox = 0.5 / this.scaleX / tw;
	const oy = 0.5 / this.scaleY / th;
	const regions = this.regions.visibleList;
	const count = regions.count;
	let vi = 0;
	for (let i = 0; i < count; i++) {
		const region = regions[i];
		const rx = region.x;
		const ry = region.y;
		const rw = region.width;
		const rh = region.height;
		const dl = rx - rw / 2 + ox;
		const dt = ry - rh / 2 + oy;
		const dr = dl + rw;
		const db = dt + rh;
		vertices[vi] = dl;
		vertices[vi + 1] = dt;
		vertices[vi + 2] = dl;
		vertices[vi + 3] = db;
		vertices[vi + 4] = dl;
		vertices[vi + 5] = db;
		vertices[vi + 6] = dr;
		vertices[vi + 7] = db;
		vertices[vi + 8] = dr;
		vertices[vi + 9] = db;
		vertices[vi + 10] = dr;
		vertices[vi + 11] = dt;
		vertices[vi + 12] = dr;
		vertices[vi + 13] = dt;
		vertices[vi + 14] = dl;
		vertices[vi + 15] = dt;
		vi += 16;
	}
	const { startPosition } = Data.config;
	if (startPosition.sceneId === this.meta.guid) {
		const dl = startPosition.x - 0.5 + ox;
		const dt = startPosition.y - 0.5 + oy;
		const dr = dl + 1;
		const db = dt + 1;
		vertices[vi] = dl;
		vertices[vi + 1] = dt;
		vertices[vi + 2] = dl;
		vertices[vi + 3] = db;
		vertices[vi + 4] = dl;
		vertices[vi + 5] = db;
		vertices[vi + 6] = dr;
		vertices[vi + 7] = db;
		vertices[vi + 8] = dr;
		vertices[vi + 9] = db;
		vertices[vi + 10] = dr;
		vertices[vi + 11] = dt;
		vertices[vi + 12] = dr;
		vertices[vi + 13] = dt;
		vertices[vi + 14] = dl;
		vertices[vi + 15] = dt;
		vi += 16;
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
		gl.drawArrays(gl.LINES, 0, vi / 2);
	}
};

Scene.drawObjectLayer = function () {
	const { max, min, floor, ceil, round } = Math;
	const activeId = this.activeTilemapId;
	const translucent = activeId !== -1 && activeId < 0x20000;
	const animAlpha = translucent ? 0.25 : 1;

	const gl = GL;
	const lightModeMap = this.showLight
		? Animation.Player.lightSamplingModes
		: this.defaultLightSamplingModes;
	const blendModeMap = this.blendModeMap;
	const textures = this.textures;
	const tilesets = Data.tilesets;
	const templates = Data.autotiles.map;
	const area = Data.config.tileArea;
	const lightmap = GL.reflectedLightMap;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const ll = sl - lightmap.maxExpansionLeft;
	const lt = st - lightmap.maxExpansionTop;
	const lr = sr + lightmap.maxExpansionRight;
	const lb = sb + lightmap.maxExpansionBottom;
	const lw = lr - ll;
	const lh = lb - lt;
	const ly = th / 2 / lh;
	const layers = gl.layers;
	const starts = gl.zeros;
	const ends = gl.arrays[1].uint32;
	const set = gl.arrays[2].uint32;
	const data = gl.arrays[3].float32;
	const datau = gl.arrays[3].uint32;
	let li = 0;
	let si = 2;
	let di = 0;
	const doodads = this.doodads;
	const length = doodads.length;
	for (let i = 0; i < length; i++) {
		const tilemap = doodads[i];
		const id = i | 0x10000;
		const active = id === activeId;
		if (tilemap.hidden && !active) {
			continue;
		}
		const tilesetMap = tilemap.tilesetMap;
		const tiles = tilemap.tiles;
		const width = tiles.width;
		const height = tiles.height;
		const tro = tiles.rowOffset;
		const anchor = this.getParallaxAnchor(tilemap);
		const ax = tilemap.anchorX * width * tw;
		const ay = tilemap.anchorY * height * th;
		const sox = anchor.x - ax + tilemap.offsetX;
		const soy = anchor.y - ay + tilemap.offsetY;
		const scroll = this.rasterizeScrollPosition(-sox, -soy);
		const left = scroll.left - area.expansionLeft;
		const top = scroll.top - area.expansionTop;
		const right = scroll.right + area.expansionRight;
		const bottom = scroll.bottom + area.expansionBottom;
		const ox = sl - scroll.left;
		const oy = st - scroll.top;
		const bx = max(floor(left / tw), 0);
		const by = max(floor(top / th), 0);
		const ex = min(ceil(right / tw), width);
		const ey = min(ceil(bottom / th), height);
		let opacity = tilemap.opacity;
		if (translucent && !active) opacity /= 4;
		opacity = Math.round(opacity * 255) << 8;
		for (let y = by; y < ey; y++) {
			for (let x = bx; x < ex; x++) {
				const i = x + y * tro;
				const tile = tiles[i];
				if (tile !== 0) {
					const guid = tilesetMap[tile >> 24];
					const tileset = tilesets[guid];
					if (tileset !== undefined) {
						switch (tileset.type) {
							case 'normal': {
								const texture = textures[tileset.image];
								if (texture instanceof ImageTexture) {
									const tx = (tile >> 8) & 0xff;
									const ty = (tile >> 16) & 0xff;
									const id = tx + ty * tileset.width;
									const tp = tileset.priorities[id] + tileset.globalPriority;
									const sw = tileset.tileWidth;
									const sh = tileset.tileHeight;
									const sx = tx * sw;
									const sy = ty * sh;
									const ax = (x + 0.5) * tw + ox;
									const ay = (y + 1) * th + oy;
									const dl = ax - sw / 2 + tileset.globalOffsetX;
									const dt = ay - sh + tileset.globalOffsetY;
									const dr = dl + sw;
									const db = dt + sh;
									const px = (ax - ll) / lw;
									const py = (ay - lt + tp * th) / lh;
									const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
									const anchor =
										round(max(min(px, 1), 0) * 0xffff) |
										(round(max(min(py - ly, 1), 0) * 0xffff) << 16);
									data[di] = texture.base.index;
									data[di + 1] = dl;
									data[di + 2] = dt;
									data[di + 3] = dr;
									data[di + 4] = db;
									data[di + 5] = (sx + 0.002) / texture.width;
									data[di + 6] = (sy + 0.002) / texture.height;
									data[di + 7] = (sx + sw - 0.002) / texture.width;
									data[di + 8] = (sy + sh - 0.002) / texture.height;
									datau[di + 9] = anchor;
									datau[di + 10] = opacity;
									datau[di + 11] = lightModeMap[tilemap.light];
									datau[di + 12] = blendModeMap[tilemap.blend];
									if (tile & 0b1) {
										data[di + 9] = data[di + 5];
										data[di + 5] = data[di + 7];
										data[di + 7] = data[di + 9];
									}
									if (starts[key] === 0) {
										starts[key] = si;
										layers[li++] = key;
									} else {
										set[ends[key] + 1] = si;
									}
									ends[key] = si;
									set[si++] = di;
									set[si++] = 0;
									di += 13;
								} else if (texture === undefined) {
									const guid = tileset.image;
									const image = Palette.images[guid];
									if (image instanceof Image) {
										textures.append(new ImageTexture(image));
										x--;
									} else {
										textures.load(guid);
									}
								}
								break;
							}
							case 'auto': {
								const tx = (tile >> 8) & 0xff;
								const ty = (tile >> 16) & 0xff;
								const id = tx + ty * tileset.width;
								const autoTile = tileset.tiles[id];
								if (!autoTile) {
									continue;
								}
								const template = templates[autoTile.template];
								if (template === undefined) {
									continue;
								}
								const nodeId = tile & 0b111111;
								const node = template.nodes[nodeId];
								if (node === undefined) {
									continue;
								}
								const texture = textures[autoTile.image];
								if (texture instanceof ImageTexture) {
									const index = this.animationFrame % node.frames.length;
									const frame = node.frames[index];
									const tp = tileset.priorities[id] + tileset.globalPriority;
									const sw = tileset.tileWidth;
									const sh = tileset.tileHeight;
									const sx = (autoTile.x + (frame & 0xff)) * sw;
									const sy = (autoTile.y + (frame >> 8)) * sh;
									const ax = (x + 0.5) * tw + ox;
									const ay = (y + 1) * th + oy;
									const dl = ax - sw / 2 + tileset.globalOffsetX;
									const dt = ay - sh + tileset.globalOffsetY;
									const dr = dl + sw;
									const db = dt + sh;
									const px = (ax - ll) / lw;
									const py = (ay - lt + tp * th) / lh;
									const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
									const anchor =
										round(max(min(px, 1), 0) * 0xffff) |
										(round(max(min(py - ly, 1), 0) * 0xffff) << 16);
									data[di] = texture.base.index;
									data[di + 1] = dl;
									data[di + 2] = dt;
									data[di + 3] = dr;
									data[di + 4] = db;
									data[di + 5] = (sx + 0.002) / texture.width;
									data[di + 6] = (sy + 0.002) / texture.height;
									data[di + 7] = (sx + sw - 0.002) / texture.width;
									data[di + 8] = (sy + sh - 0.002) / texture.height;
									datau[di + 9] = anchor;
									datau[di + 10] = opacity;
									datau[di + 11] = lightModeMap[tilemap.light];
									datau[di + 12] = blendModeMap[tilemap.blend];
									if (starts[key] === 0) {
										starts[key] = si;
										layers[li++] = key;
									} else {
										set[ends[key] + 1] = si;
									}
									ends[key] = si;
									set[si++] = di;
									set[si++] = 0;
									di += 13;
								} else if (texture === undefined) {
									const guid = autoTile.image;
									const image = Palette.images[guid];
									if (image instanceof Image) {
										textures.append(new ImageTexture(image));
										x--;
									} else {
										textures.load(guid);
									}
								}
								break;
							}
						}
					}
				}
			}
		}
	}

	const actors = this.actors;
	const animations = this.animations;
	const particles = this.particles;
	for (let i = 0; i < 3; i++) {
		const kind = (i + 1) << 16;
		if (i <= 1) {
			const list = i === 0 ? actors : animations;
			const length = list.length;
			for (let i = 0; i < length; i++) {
				const object = list[i];
				if (object.hidden) continue;
				const player = object.player;
				if (player.visible) {
					const py = player.anchorY;
					const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
					data[di] = i | kind;
					if (starts[key] === 0) {
						starts[key] = si;
						layers[li++] = key;
					} else {
						set[ends[key] + 1] = si;
					}
					ends[key] = si;
					set[si++] = di;
					set[si++] = 0;
					di += 1;
				}
			}
		} else {
			const length = particles.length;
			for (let i = 0; i < length; i++) {
				const object = particles[i];
				if (object.hidden) continue;
				const emitter = object.emitter;
				if (emitter?.visible) {
					const py = emitter.anchorY;
					const key = max(0, min(0x3ffff, round(py * 0x20000 + 0x10000)));
					data[di] = i | kind;
					if (starts[key] === 0) {
						starts[key] = si;
						layers[li++] = key;
					} else {
						set[ends[key] + 1] = si;
					}
					ends[key] = si;
					set[si++] = di;
					set[si++] = 0;
					di += 1;
				}
			}
		}
	}

	if (li !== 0) {
		const vertices = gl.arrays[0].float32;
		const attributes = gl.arrays[0].uint32;
		const blend = gl.batchRenderer.setBlendMode;
		const push = gl.batchRenderer.push;
		const response = gl.batchRenderer.response;
		const program = gl.spriteProgram.use();
		const matrix = gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
		if (activeId < 0x20000) {
			gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
		} else {
			gl.uniform4f(program.u_Tint, -0.2, -0.2, -0.2, 0.8);
		}
		gl.batchRenderer.bindProgram();
		gl.batchRenderer.setAttrSize(8);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		const queue = new Uint32Array(layers.buffer, 0, li).sort();
		for (let i = 0; i < li; i++) {
			const key = queue[i];
			let si = starts[key];
			starts[key] = 0;
			do {
				const di = set[si];
				const code = data[di];
				if (code < 0x10000) {
					blend(blendModeMap[datau[di + 12]]);
					push(code);
					const dl = data[di + 1];
					const dt = data[di + 2];
					const dr = data[di + 3];
					const db = data[di + 4];
					const sl = data[di + 5];
					const st = data[di + 6];
					const sr = data[di + 7];
					const sb = data[di + 8];
					const anchor = datau[di + 9];
					const opacity = datau[di + 10];
					const mode = datau[di + 11] << 16;
					const vi = response[0] * 8;
					const param = response[1] | opacity | mode;
					vertices[vi] = dl;
					vertices[vi + 1] = dt;
					vertices[vi + 2] = sl;
					vertices[vi + 3] = st;
					attributes[vi + 4] = param;
					attributes[vi + 5] = 0x00ff00ff;
					attributes[vi + 6] = 0x00ff00ff;
					attributes[vi + 7] = anchor;
					vertices[vi + 8] = dl;
					vertices[vi + 9] = db;
					vertices[vi + 10] = sl;
					vertices[vi + 11] = sb;
					attributes[vi + 12] = param;
					attributes[vi + 13] = 0x00ff00ff;
					attributes[vi + 14] = 0x00ff00ff;
					attributes[vi + 15] = anchor;
					vertices[vi + 16] = dr;
					vertices[vi + 17] = db;
					vertices[vi + 18] = sr;
					vertices[vi + 19] = sb;
					attributes[vi + 20] = param;
					attributes[vi + 21] = 0x00ff00ff;
					attributes[vi + 22] = 0x00ff00ff;
					attributes[vi + 23] = anchor;
					vertices[vi + 24] = dr;
					vertices[vi + 25] = dt;
					vertices[vi + 26] = sr;
					vertices[vi + 27] = st;
					attributes[vi + 28] = param;
					attributes[vi + 29] = 0x00ff00ff;
					attributes[vi + 30] = 0x00ff00ff;
					attributes[vi + 31] = anchor;
				} else if (code < 0x20000) {
					const actor = actors[code & 0x0ffff];
					actor.player.draw(animAlpha * (actor.enabled ? 1 : 0.3));
				} else if (code < 0x30000) {
					const animation = animations[code & 0x0ffff];
					animation.player.draw(animAlpha * (animation.enabled ? 1 : 0.3));
				} else {
					gl.batchRenderer.draw();
					const particle = particles[code & 0x0ffff];
					particle.emitter.draw(animAlpha * (particle.enabled ? 1 : 0.3));
				}
			} while ((si = set[si + 1]) !== 0);
		}
		gl.batchRenderer.draw();
		gl.batchRenderer.unbindProgram();
		gl.blend = 'normal';
	}
};

Scene.drawDirectLightLayer = function () {
	if (this.showLight) {
		GL.matrix.reset();
		GL.blend = 'additive';
		GL.drawImage(GL.directLightMap, 0, 0, GL.width, GL.height);
		GL.blend = 'normal';
	}
};

Scene.drawNameLayer = function () {
	if (this.target?.name) {
		const gl = GL;
		const sl = this.scrollLeft * this.scaleX;
		const st = this.scrollTop * this.scaleY;
		const stw = this.scaledTileWidth;
		const sth = this.scaledTileHeight;
		const size = GL.context2d.size;
		const color = 0xffffffff;
		const shadow = 0x80000000;
		const target = this.target;
		const x = target.x * stw - sl;
		const y = target.y * sth - st - size - 8;
		gl.fillTextWithOutline(target.name, x, y, color, shadow);
	}
};

Scene.drawTerrainLayer = function () {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const terrains = this.terrains;
	const tro = terrains.rowOffset;
	const width = this.width;
	const height = this.height;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const bx = Math.max(Math.floor(sl / tw), 0);
	const by = Math.max(Math.floor(st / th), 0);
	const ex = Math.min(Math.ceil(sr / tw), width);
	const ey = Math.min(Math.ceil(sb / th), height);
	let vi = 0;
	let flag = false;

	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (terrains[i] === 0b10) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y;
					vertices[vi + 2] = x;
					vertices[vi + 3] = y + 1;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 4] = x;
				vertices[vi + 5] = y + 1;
				vertices[vi + 6] = x;
				vertices[vi + 7] = y;
				vi += 8;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 4] = ex;
			vertices[vi + 5] = y + 1;
			vertices[vi + 6] = ex;
			vertices[vi + 7] = y;
			vi += 8;
		}
	}
	const mi1 = vi;

	for (let y = by; y < ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (terrains[i] === 0b01) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y;
					vertices[vi + 2] = x;
					vertices[vi + 3] = y + 1;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 4] = x;
				vertices[vi + 5] = y + 1;
				vertices[vi + 6] = x;
				vertices[vi + 7] = y;
				vi += 8;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 4] = ex;
			vertices[vi + 5] = y + 1;
			vertices[vi + 6] = ex;
			vertices[vi + 7] = y;
			vi += 8;
		}
	}
	const mi2 = vi;

	const ox = 0.5 / this.scaleX / tw;
	const oy = 0.5 / this.scaleY / th;
	for (let y = by; y <= ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (
				y < ey && terrains[i] === 0b10
					? y === 0 || terrains[i - tro] !== 0b10
					: y !== 0 && terrains[i - tro] === 0b10
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y + oy;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox * 2;
				vertices[vi + 3] = y + oy;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = ex + ox * 2;
			vertices[vi + 3] = y + oy;
			vi += 4;
		}
	}

	for (let x = bx; x <= ex; x++) {
		for (let y = by; y < ey; y++) {
			const i = x + y * tro;
			if (
				x < ex && terrains[i] === 0b10
					? x === 0 || terrains[i - 1] !== 0b10
					: x !== 0 && terrains[i - 1] === 0b10
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x + ox;
					vertices[vi + 1] = y;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox;
				vertices[vi + 3] = y + oy * 2;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = x + ox;
			vertices[vi + 3] = ey + oy * 2;
			vi += 4;
		}
	}
	const mi3 = vi;

	for (let y = by; y <= ey; y++) {
		for (let x = bx; x < ex; x++) {
			const i = x + y * tro;
			if (
				y < ey && terrains[i] === 0b01
					? y === 0 || terrains[i - tro] === 0b00
					: y !== 0 && terrains[i - tro] === 0b01
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x;
					vertices[vi + 1] = y + oy;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox * 2;
				vertices[vi + 3] = y + oy;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = ex + ox * 2;
			vertices[vi + 3] = y + oy;
			vi += 4;
		}
	}

	for (let x = bx; x <= ex; x++) {
		for (let y = by; y < ey; y++) {
			const i = x + y * tro;
			if (
				x < ex && terrains[i] === 0b01
					? x === 0 || terrains[i - 1] === 0b00
					: x !== 0 && terrains[i - 1] === 0b01
			) {
				if (flag) {
					continue;
				} else {
					flag = true;
					vertices[vi] = x + ox;
					vertices[vi + 1] = y;
				}
			} else if (flag) {
				flag = false;
				vertices[vi + 2] = x + ox;
				vertices[vi + 3] = y + oy * 2;
				vi += 4;
			}
		}
		if (flag) {
			flag = false;
			vertices[vi + 2] = x + ox;
			vertices[vi + 3] = ey + oy * 2;
			vi += 4;
		}
	}

	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		if (mi1 !== mi2) {
			gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 0.25);
			gl.drawElements(gl.TRIANGLES, (mi2 - mi1) * 0.75, gl.UNSIGNED_INT, mi1 * 3);
		}
		if (mi1 !== 0) {
			gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 0.25);
			gl.drawElements(gl.TRIANGLES, mi1 * 0.75, gl.UNSIGNED_INT, 0);
		}
		if (mi3 !== vi) {
			gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 1);
			gl.drawArrays(gl.LINES, mi3 / 2, (vi - mi3) / 2);
		}
		if (mi2 !== mi3) {
			gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
			gl.drawArrays(gl.LINES, mi2 / 2, (mi3 - mi2) / 2);
		}
	}
};

Scene.drawLightTextures = function () {
	if (this.showLight) {
		const gl = GL;
		const ambient = this.ambient;
		const ambientRed = ambient.red / 255;
		const ambientGreen = ambient.green / 255;
		const ambientBlue = ambient.blue / 255;
		const ambientDirect = ambient.direct;
		const cx = gl.reflectedLightMap.clipX;
		const cy = gl.reflectedLightMap.clipY;
		const cw = gl.reflectedLightMap.clipWidth;
		const ch = gl.reflectedLightMap.clipHeight;
		gl.bindFBO(gl.reflectedLightMap.fbo);
		gl.setViewport(cx, cy, cw, ch);
		gl.clearColor(ambientRed, ambientGreen, ambientBlue, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		const queue = gl.arrays[1].uint16;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const twh = tw / 2;
		const vs = tw / th;
		const sl = this.lightLeft;
		const st = this.lightTop;
		const sr = this.lightRight;
		const sb = this.lightBottom;
		const lights = this.lights;
		const length = lights.length;
		let qi0 = 0;
		let qi1 = 0;
		let qi2 = 0;
		let qi3 = 0;
		for (let i = 0; i < length; i++) {
			const light = lights[i];
			if (light.hidden) continue;
			const ox = light.x * tw;
			const oy = light.y * th;
			switch (light.type) {
				case 'point': {
					const hr = light.range * twh;
					const px = ox < sl ? sl : ox > sr ? sr : ox;
					const py = oy < st ? st : oy > sb ? sb : oy;
					if ((px - ox) ** 2 + ((py - oy) * vs) ** 2 < hr ** 2) {
						switch (light.blend) {
							case 'max':
								queue[qi0++] = i;
								continue;
							case 'screen':
								queue[qi1++ | 0x10000] = i;
								continue;
							case 'additive':
								queue[qi2++ | 0x20000] = i;
								continue;
							case 'subtract':
								queue[qi3++ | 0x30000] = i;
								continue;
						}
					}
					continue;
				}
				case 'area': {
					const instance = light.instance;
					const ml = ox + instance.measureOffsetX * tw;
					const mt = oy + instance.measureOffsetY * th;
					const mr = ml + instance.measureWidth * tw;
					const mb = mt + instance.measureHeight * th;
					if (ml < sr && mt < sb && mr > sl && mb > st) {
						switch (light.blend) {
							case 'max':
								queue[qi0++] = i;
								continue;
							case 'screen':
								queue[qi1++ | 0x10000] = i;
								continue;
							case 'additive':
								queue[qi2++ | 0x20000] = i;
								continue;
							case 'subtract':
								queue[qi3++ | 0x30000] = i;
								continue;
						}
					}
					continue;
				}
			}
		}
		const count = qi0 + qi1 + qi2 + qi3;
		if (count !== 0) {
			for (let i = 0; i < qi1; i++) {
				queue[qi0 + i] = queue[i | 0x10000];
			}
			for (let i = 0; i < qi2; i++) {
				queue[qi0 + qi1 + i] = queue[i | 0x20000];
			}
			for (let i = 0; i < qi3; i++) {
				queue[qi0 + qi1 + qi2 + i] = queue[i | 0x30000];
			}
		}
		if (count !== 0) {
			const projMatrix = Matrix.instance
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.scale(tw, th);
			for (let i = 0; i < count; i++) {
				const light = lights[queue[i]];
				light.instance.draw(projMatrix, 1);
			}
			gl.blend = 'normal';
		}
		gl.resetViewport();
		const directRed = ambientRed * ambientDirect;
		const directGreen = ambientGreen * ambientDirect;
		const directBlue = ambientBlue * ambientDirect;
		// 避免使用直射光纹理
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFBO(gl.directLightMap.fbo);
		gl.clearColor(directRed, directGreen, directBlue, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		if (count !== 0) {
			const sl = this.scrollLeft;
			const st = this.scrollTop;
			const sr = this.scrollRight;
			const sb = this.scrollBottom;
			const projMatrix = Matrix.instance
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.scale(tw, th);
			for (let i = 0; i < count; i++) {
				const light = lights[queue[i]];
				light.instance.draw(projMatrix, light.direct);
			}
			gl.blend = 'normal';
		}
		gl.unbindFBO();
	}
};

Scene.drawTileMarquee = function () {
	const marquee = this.marquee;
	if (marquee.visible) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const grid = this.getGridContext();
		const sx = grid.offsetX;
		const sy = grid.offsetY;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const scroll = this.rasterizeScrollPosition(-sx, -sy);
		const sl = scroll.left;
		const st = scroll.top;
		const sr = scroll.right;
		const sb = scroll.bottom;

		const dl = marquee.x;
		const dt = marquee.y;
		const dr = dl + marquee.width;
		const db = dt + marquee.height;
		const ox = 0.5 / this.scaleX / tw;
		const oy = 0.5 / this.scaleY / th;
		vertices[0] = dl + ox;
		vertices[1] = dt + oy;
		vertices[2] = dl + ox;
		vertices[3] = db + oy;
		vertices[4] = dr + ox;
		vertices[5] = db + oy;
		vertices[6] = dr + ox;
		vertices[7] = dt + oy;
		let vi = 8;
		let valid = null;
		let invalid = null;
		const context = Scene.tilemap ?? Scene;
		const sw = context.width;
		const sh = context.height;
		const mw = marquee.width;
		const mh = marquee.height;
		const bx = marquee.x;
		const by = marquee.y;
		const ex = bx + mw;
		const ey = by + mh;
		const max = Math.max;
		const min = Math.min;
		if (ex > 0 && bx < sw && ey > 0 && by < sh) {
			const dl = max(bx, 0);
			const dt = max(by, 0);
			const dr = min(ex, sw);
			const db = min(ey, sh);
			vertices[vi] = dl;
			vertices[vi + 1] = dt;
			vertices[vi + 2] = dl;
			vertices[vi + 3] = db;
			vertices[vi + 4] = dr;
			vertices[vi + 5] = db;
			vertices[vi + 6] = dr;
			vertices[vi + 7] = dt;
			valid = vi;
			vi += 8;
			if (bx < 0) {
				vertices[vi] = 0;
				vertices[vi + 1] = max(by, 0);
				vertices[vi + 2] = bx;
				vertices[vi + 3] = by;
				vertices[vi + 4] = bx;
				vertices[vi + 5] = ey;
				vertices[vi + 6] = 0;
				vertices[vi + 7] = min(ey, sh);
				invalid = invalid || vi;
				vi += 8;
			}
			if (by < 0) {
				vertices[vi] = max(bx, 0);
				vertices[vi + 1] = 0;
				vertices[vi + 2] = bx;
				vertices[vi + 3] = by;
				vertices[vi + 4] = ex;
				vertices[vi + 5] = by;
				vertices[vi + 6] = min(ex, sw);
				vertices[vi + 7] = 0;
				invalid = invalid || vi;
				vi += 8;
			}
			if (ex > sw) {
				vertices[vi] = sw;
				vertices[vi + 1] = max(by, 0);
				vertices[vi + 2] = ex;
				vertices[vi + 3] = by;
				vertices[vi + 4] = ex;
				vertices[vi + 5] = ey;
				vertices[vi + 6] = sw;
				vertices[vi + 7] = min(ey, sh);
				invalid = invalid || vi;
				vi += 8;
			}
			if (ey > sh) {
				vertices[vi] = max(bx, 0);
				vertices[vi + 1] = sh;
				vertices[vi + 2] = bx;
				vertices[vi + 3] = ey;
				vertices[vi + 4] = ex;
				vertices[vi + 5] = ey;
				vertices[vi + 6] = min(ex, sw);
				vertices[vi + 7] = sh;
				invalid = invalid || vi;
				vi += 8;
			}
		} else {
			vertices[vi] = bx;
			vertices[vi + 1] = by;
			vertices[vi + 2] = bx;
			vertices[vi + 3] = ey;
			vertices[vi + 4] = ex;
			vertices[vi + 5] = ey;
			vertices[vi + 6] = ex;
			vertices[vi + 7] = by;
			invalid = vi;
			vi += 8;
		}
		if (valid !== null) {
			valid = {
				start: valid * 0.75,
				count: 6
			};
		}
		if (invalid !== null) {
			invalid = {
				start: invalid * 0.75,
				count: (vi - invalid) * 0.75
			};
		}
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		if (valid !== null) {
			gl.vertexAttrib4fv(program.a_Color, marquee.backgroundColor);
			gl.drawElements(gl.TRIANGLES, valid.count, gl.UNSIGNED_INT, valid.start * 4);
		}
		if (invalid !== null) {
			gl.vertexAttrib4fv(program.a_Color, marquee.backgroundColorInvalid);
			gl.drawElements(gl.TRIANGLES, invalid.count, gl.UNSIGNED_INT, invalid.start * 4);
		}
		gl.vertexAttrib4fv(program.a_Color, marquee.borderColor);
		gl.drawArrays(gl.LINE_LOOP, 0, 4);
	}
};

Scene.drawTerrainMarquee = function () {
	const marquee = this.marquee;
	if (marquee.visible) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const dl = marquee.x;
		const dt = marquee.y;
		const dr = marquee.x + marquee.width;
		const db = marquee.y + marquee.height;
		const ox = 0.5 / this.scaleX / tw;
		const oy = 0.5 / this.scaleY / th;
		vertices[0] = dl + ox;
		vertices[1] = dt + oy;
		vertices[2] = dl + ox;
		vertices[3] = db + oy;
		vertices[4] = dr + ox;
		vertices[5] = db + oy;
		vertices[6] = dr + ox;
		vertices[7] = dt + oy;
		const program = gl.graphicProgram.use();
		gl.matrix
			.project(gl.flip, sr - sl, sb - st)
			.translate(-sl, -st)
			.scale(tw, th);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8);
		switch (marquee.terrain) {
			case 0b00:
				gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 0.25);
				break;
			case 0b01:
				gl.vertexAttrib4f(program.a_Color, 0, 0, 1, 0.25);
				break;
			case 0b10:
				gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 0.25);
				break;
		}
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
		gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
		gl.drawArrays(gl.LINE_LOOP, 0, 4);
	}
};

Scene.drawTilemapWireframe = function () {
	if (this.target?.class === 'tilemap') {
		const tilemap = this.target;
		const anchor = this.getParallaxAnchor(tilemap);
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const mx = tilemap.x;
		const my = tilemap.y;
		const mw = tilemap.width;
		const mh = tilemap.height;
		const ox = tilemap.offsetX;
		const oy = tilemap.offsetY;
		const pw = mw * tw;
		const ph = mh * th;
		const ax = tilemap.anchorX * pw;
		const ay = tilemap.anchorY * ph;
		const dl = anchor.x - ax + ox;
		const dt = anchor.y - ay + oy;
		const dr = dl + pw;
		const db = dt + ph;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			const ml = dl / tw;
			const mt = dt / th;
			this.drawRectWireframeOnTilemap(ml, mt, mw, mh, mx, my, 0);
			this.drawTargetAnchor(tilemap, 0);
		}
	}
};

Scene.drawAnimationWireframe = function () {
	switch (this.target?.class) {
		case 'actor':
		case 'animation': {
			const target = this.target;
			const data = target.data;
			if (data === undefined) {
				return;
			}
			const sl = this.scrollLeft;
			const st = this.scrollTop;
			const sr = this.scrollRight;
			const sb = this.scrollBottom;
			const tw = this.tileWidth;
			const th = this.tileHeight;
			const ax = target.x;
			const ay = target.y;
			const as = target.class === 'actor' ? Math.max(data.size * target.player.scale, 1) : 1;
			const ar = as / 2;
			const ml = (ax - ar) * tw;
			const mt = (ay - ar) * th;
			const mr = (ax + ar) * tw;
			const mb = (ay + ar) * th;
			if (mr > sl && ml < sr && mb > st && mt < sb) {
				this.drawRectWireframeOnTilemap(ax - ar, ay - ar, as, as, ax, ay, 0);
			}
			break;
		}
	}
};

Scene.drawAnimationAnchor = function () {
	switch (this.target?.class) {
		case 'actor': {
			const team = Data.teams.map[this.target.teamId];
			const color = INTRGBA(team?.color ?? 'ffffffff');
			this.drawTargetAnchor(this.target, 0, color);
			break;
		}
		case 'animation':
			this.drawTargetAnchor(this.target, 0);
			break;
	}
};

Scene.drawLightWireframe = function () {
	if (this.target?.class === 'light') {
		const light = this.target;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		switch (light.type) {
			case 'point': {
				const ox = light.x * tw;
				const oy = light.y * th;
				const hr = (light.range / 2) * tw;
				const vs = tw / th;
				const px = ox < sl ? sl : ox > sr ? sr : ox;
				const py = oy < st ? st : oy > sb ? sb : oy;
				if ((px - ox) ** 2 + ((py - oy) * vs) ** 2 < hr ** 2) {
					const vr = (light.range / 2) * th;
					this.drawOvalWireframe(ox, oy, hr, vr, 0xffffffff);
					this.drawTargetAnchor(light, 0);
				}
				break;
			}
			case 'area': {
				const instance = light.instance;
				const ax = light.x;
				const ay = light.y;
				const ox = light.x * tw;
				const oy = light.y * th;
				const ml = ox + instance.measureOffsetX * tw;
				const mt = oy + instance.measureOffsetY * th;
				const mr = ml + instance.measureWidth * tw;
				const mb = mt + instance.measureHeight * th;
				if (ml < sr && mt < sb && mr > sl && mb > st) {
					const rl = light.x - instance.anchorOffsetX;
					const rt = light.y - instance.anchorOffsetY;
					const rw = light.width;
					const rh = light.height;
					const angle = instance.angle;
					this.drawRectWireframeOnTilemap(rl, rt, rw, rh, ax, ay, angle);
					this.drawTargetAnchor(light, angle);
				}
				break;
			}
		}
	}
};

Scene.drawRegionWireframe = function () {
	if (this.target?.class === 'region') {
		const region = this.target;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const rx = region.x;
		const ry = region.y;
		const rw = region.width;
		const rh = region.height;
		const rl = rx - rw / 2;
		const rt = ry - rh / 2;
		const dl = rl * tw;
		const dt = rt * th;
		const dr = (rl + rw) * tw;
		const db = (rt + rh) * th;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			this.drawRectWireframeOnTilemap(rl, rt, rw, rh, rx, ry, 0);
			this.drawTargetAnchor(region, 0);
		}
	}
};

Scene.drawParticleEmitterWireframe = function () {
	if (this.target?.class === 'particle') {
		const particle = this.target;
		const rect = particle.emitter?.bounding;
		const angle = Math.radians(particle.angle);
		if (rect?.hasArea) {
			const coords = this.getConvertedCoords(particle);
			const ax = coords.x;
			const ay = coords.y;
			const rl = ax + rect.left * particle.scale;
			const rt = ay + rect.top * particle.scale;
			const rr = ax + rect.right * particle.scale;
			const rb = ay + rect.bottom * particle.scale;
			this.drawRectWireframe(rl, rt, rr, rb, ax, ay, angle);
		}
		this.drawTargetAnchor(particle, angle);
	}
};

Scene.drawParallaxWireframe = function () {
	if (this.target?.class === 'parallax') {
		const parallax = this.target;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const texture = parallax.player.texture;
		const width = texture?.width ?? 128;
		const height = texture?.height ?? 128;
		const anchor = this.getParallaxAnchor(parallax);
		const pw = parallax.scaleX * parallax.repeatX * width;
		const ph = parallax.scaleY * parallax.repeatY * height;
		const ox = parallax.offsetX;
		const oy = parallax.offsetY;
		const ax = parallax.anchorX * pw;
		const ay = parallax.anchorY * ph;
		const dl = anchor.x - ax + ox;
		const dt = anchor.y - ay + oy;
		const dr = dl + pw;
		const db = dt + ph;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			const { x, y } = this.getConvertedCoords(parallax);
			this.drawRectWireframe(dl, dt, dr, db, x, y, 0);
			this.drawTargetAnchor(parallax, 0);
		}
	}
};

Scene.createStartPositionTexture = function () {
	let texture = this.startPositionTexture;
	if (texture === null) {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		const context = canvas.getContext('2d');
		const y = (canvas.height - 160) / 2 + 160 * 0.85;
		context.fillStyle = 'rgba(0, 255, 255, 0.5)';
		context.fillRect(0, 0, 256, 256);
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.shadowColor = '#000000';
		context.shadowBlur = 4;
		context.shadowOffsetY = 4;
		context.font = '160px Awesome';
		context.fillText('\uf041', 128, y);
		texture = new Texture();
		texture.fromImage(canvas);
		texture.base.protected = true;
		this.startPositionTexture = texture;
	}
	return texture;
};

Scene.drawStartPosition = function () {
	const { startPosition } = Data.config;
	if (startPosition.sceneId === this.meta.guid) {
		const tw = this.tileWidth;
		const th = this.tileHeight;
		const sl = this.scrollLeft;
		const st = this.scrollTop;
		const sr = this.scrollRight;
		const sb = this.scrollBottom;
		const dl = (startPosition.x - 0.5) * tw;
		const dt = (startPosition.y - 0.5) * th;
		const dr = dl + tw;
		const db = dt + th;
		if (dl < sr && dt < sb && dr > sl && db > st) {
			const gl = GL;
			const vertices = gl.arrays[0].float32;
			vertices[0] = dl;
			vertices[1] = dt;
			vertices[2] = 0;
			vertices[3] = 0;
			vertices[4] = dl;
			vertices[5] = db;
			vertices[6] = 0;
			vertices[7] = 1;
			vertices[8] = dr;
			vertices[9] = db;
			vertices[10] = 1;
			vertices[11] = 1;
			vertices[12] = dr;
			vertices[13] = dt;
			vertices[14] = 1;
			vertices[15] = 0;

			gl.alpha = 0.5;
			const texture = this.createStartPositionTexture();
			const program = gl.imageProgram.use();
			gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
			gl.bindVertexArray(program.vao);
			gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
			gl.uniform1i(program.u_LightMode, 0);
			gl.uniform1i(program.u_ColorMode, 0);
			gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 16);
			gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture);
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
			gl.alpha = 1;
		}
	}
};
