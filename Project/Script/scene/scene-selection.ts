import { Scene } from './scene-window.ts';
import { GL } from '../webgl/webgl-init.ts';
import { Vector } from '../webgl/vector2.ts';
Scene.selectObject = function (x, y) {
	let precise = false;
	let target = null;
	let weight = 0;

	if (!target) {
		const actors = this.actors;
		const animations = this.animations;
		for (let i = 0; i < 2; i++) {
			const list = i === 0 ? actors : animations;
			const length = list.length;
			for (let i = length - 1; i >= 0; i--) {
				const object = list[i];
				if (object.hidden || object.locked) {
					continue;
				}
				const size = object.data?.size ?? 1;
				const radius = Math.max(size, 1) / 2;
				const ax = object.x;
				const ay = object.y;
				const l = ax - radius;
				const r = ax + radius;
				const t = ay - radius - 1;
				const b = ay + radius;
				if (x >= l && x < r && y >= t && y < b) {
					const p = Math.dist(x, y, ax, ay) <= radius;
					const w = (p ? 0 : -100) + ay / 2 - Math.abs(x - ax) - Math.abs(y - ay);
					if (target === null || weight < w) {
						if (!precise) {
							precise = p;
						}
						target = object;
						weight = w;
					}
				}
			}
		}
	}

	if (!precise) {
		target = this.selectRegion(x, y) ?? target;
	}

	if (!target) {
		target = this.selectParticleEmitter(x, y);
	}

	if (!target && this.showLight) {
		target = this.selectLight(x, y);
	}

	if (!target) {
		target = this.selectSortedLayer(x, y);
	}

	return target;
};

Scene.selectRegion = function (x, y) {
	let target = null;
	let weight = 0;
	const regions = this.regions;
	const length = regions.length;
	for (let i = length - 1; i >= 0; i--) {
		const region = regions[i];
		if (region.hidden || region.locked) {
			continue;
		}
		const rw = region.width;
		const rh = region.height;
		const rl = region.x - rw / 2;
		const rt = region.y - rh / 2;
		const rr = rl + rw;
		const rb = rt + rh;
		if (x >= rl && y >= rt && x < rr && y < rb) {
			const w = -Math.min(rw, rh) - Math.abs(x - region.x) - Math.abs(y - region.y);
			if (target === null || weight < w) {
				target = region;
				weight = w;
			}
		}
	}
	return target;
};

Scene.selectLight = function (x, y) {
	let target = null;
	let weight = 0;
	const lights = this.lights;
	const length = lights.length;
	for (let i = length - 1; i >= 0; i--) {
		const light = lights[i];
		if (light.hidden || light.locked) {
			continue;
		}
		switch (light.type) {
			case 'point': {
				const rx = x - light.x;
				const ry = y - light.y;
				const lr = light.range / 2;
				if (rx ** 2 + ry ** 2 <= lr ** 2) {
					const w = -Math.PI * lr ** 2 - Math.abs(rx) - Math.abs(ry);
					if (target === null || weight < w) {
						target = light;
						weight = w;
					}
				}
				continue;
			}
			case 'area': {
				const instance = light.instance;
				const rx = x - light.x;
				const ry = y - light.y;
				const lw = light.width;
				const lh = light.height;
				const ll = -instance.anchorOffsetX;
				const lt = -instance.anchorOffsetY;
				const lr = ll + lw;
				const lb = lt + lh;
				const angle = instance.angle;
				const cos = Math.cos(-angle);
				const sin = Math.sin(-angle);
				const px = rx * cos - ry * sin;
				const py = rx * sin + ry * cos;
				if (px >= ll && py >= lt && px < lr && py < lb) {
					const w = -lw * lh - Math.abs(rx) - Math.abs(ry);
					if (target === null || weight < w) {
						target = light;
						weight = w;
					}
				}
				continue;
			}
		}
	}
	return target;
};

Scene.selectParticleEmitter = function (x, y) {
	let target = null;
	let weight = 0;
	const convert = this.getConvertedCoords;
	const point = convert(this.sharedPoint.set(x, y));
	const mx = point.x;
	const my = point.y;
	const particles = this.particles;
	const length = particles.length;
	for (let i = length - 1; i >= 0; i--) {
		const particle = particles[i];
		if (particle.hidden || particle.locked) {
			continue;
		}
		const emitter = particle.emitter;
		if (emitter?.bounding.hasArea) {
			const rect = emitter.bounding;
			const point = convert(particle);
			const rx = mx - point.x;
			const ry = my - point.y;
			const rl = rect.left * particle.scale;
			const rt = rect.top * particle.scale;
			const rr = rect.right * particle.scale;
			const rb = rect.bottom * particle.scale;
			const angle = Math.radians(particle.angle);
			const cos = Math.cos(-angle);
			const sin = Math.sin(-angle);
			const px = rx * cos - ry * sin;
			const py = rx * sin + ry * cos;
			if (px >= rl && py >= rt && px < rr && py < rb) {
				const w = -rect.width * rect.height - Math.abs(rx) - Math.abs(ry);
				if (target === null || weight < w) {
					target = particle;
					weight = w;
				}
			}
		} else {
			// 否则默认设置一个图块的区域
			const rl = particle.x - 0.5;
			const rt = particle.y - 0.5;
			const rr = particle.x + 0.5;
			const rb = particle.y + 0.5;
			if (x >= rl && y >= rt && x < rr && y < rb) {
				const w = -Math.abs(x - particle.x) - Math.abs(y - particle.y);
				if (target === null || weight < w) {
					target = particle;
					weight = w;
				}
			}
		}
	}
	return target;
};

Scene.selectSortedLayer = function (x, y) {
	const sPoint = this.sharedPoint.set(x, y);
	const dPoint = this.getConvertedCoords(sPoint);
	const mx = dPoint.x;
	const my = dPoint.y;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	for (let i = 0; i < 3; i++) {
		let layers;
		switch (i) {
			case 0:
				layers = this.foregrounds;
				break;
			case 1:
				layers = this.doodads;
				break;
			case 2:
				layers = this.backgrounds;
				break;
		}
		const length = layers.length;
		for (let i = length - 1; i >= 0; i--) {
			const object = layers[i];
			if (object.hidden || object.locked) {
				continue;
			}
			switch (object.class) {
				case 'parallax': {
					const parallax = object;
					const texture = parallax.player.texture;
					const width = texture?.width ?? 128;
					const height = texture?.height ?? 128;
					const pw = parallax.scaleX * parallax.repeatX * width;
					const ph = parallax.scaleY * parallax.repeatY * height;
					const anchor = this.getParallaxAnchor(parallax);
					const ox = parallax.offsetX;
					const oy = parallax.offsetY;
					const ax = parallax.anchorX * pw;
					const ay = parallax.anchorY * ph;
					const pl = anchor.x - ax + ox;
					const pt = anchor.y - ay + oy;
					const pr = pl + pw;
					const pb = pt + ph;
					if (mx >= pl && my >= pt && mx < pr && my < pb) {
						return parallax;
					}
					continue;
				}
				case 'tilemap': {
					const tilemap = object;
					const anchor = this.getParallaxAnchor(tilemap, true);
					const rw = tilemap.width;
					const rh = tilemap.height;
					const ox = tilemap.offsetX;
					const oy = tilemap.offsetY;
					const ax = tilemap.anchorX * rw;
					const ay = tilemap.anchorY * rh;
					const rl = anchor.x - ax + ox / tw;
					const rt = anchor.y - ay + oy / th;
					const rr = rl + rw;
					const rb = rt + rh;
					if (x >= rl && y >= rt && x < rr && y < rb) {
						return tilemap;
					}
					continue;
				}
			}
		}
	}
	return null;
};

Scene.drawOvalWireframe = function (ox, oy, hr, vr, color) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const scale = this.scale;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const offset = Math.max(1, 0.5 / scale);
	const hmr = hr - offset;
	const vmr = vr - offset;
	const segments = 360;
	const step = (Math.PI * 2) / segments;
	let vi = 0;
	for (let i = 0, j = 1; i < segments; i++, j = -j) {
		const angle = i * step;
		const or = j * offset;
		vertices[vi] = ox + (hmr + or) * Math.cos(angle);
		vertices[vi + 1] = oy + (vmr + or) * Math.sin(angle);
		vi += 2;
	}
	vertices[vi] = vertices[0];
	vertices[vi + 1] = vertices[1];
	vertices[vi + 2] = vertices[2];
	vertices[vi + 3] = vertices[3];
	vi += 4;
	const program = gl.graphicProgram.use();
	const red = (color & 0xff) / 255;
	const green = ((color >> 8) & 0xff) / 255;
	const blue = ((color >> 16) & 0xff) / 255;
	const alpha = ((color >> 24) & 0xff) / 255;
	gl.matrix.project(gl.flip, sr - sl, sb - st).translate(-sl, -st);
	gl.bindVertexArray(program.vao.a10);
	gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
	gl.vertexAttrib4f(program.a_Color, red, green, blue, alpha);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, vi / 2);
};

Scene.drawTargetAnchor = function (target, angle, color = 0xff00ff00) {
	const { x, y } = this.getConvertedCoords(target);
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const scale = this.scale;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const offset = Math.max(1, 0.5 / scale);
	const sox = scale <= 0.5 ? 0.5 : 0;
	const o1 = offset;
	const o4 = offset * 4;
	vertices[0] = x - o1;
	vertices[1] = y - o4;
	vertices[2] = x - o1;
	vertices[3] = y + o4;
	vertices[4] = x + o1;
	vertices[5] = y + o4;
	vertices[6] = x + o1;
	vertices[7] = y + o4;
	vertices[8] = x + o1;
	vertices[9] = y - o4;
	vertices[10] = x - o1;
	vertices[11] = y - o4;
	vertices[12] = x - o4;
	vertices[13] = y - o1;
	vertices[14] = x - o4;
	vertices[15] = y + o1;
	vertices[16] = x + o4;
	vertices[17] = y + o1;
	vertices[18] = x + o4;
	vertices[19] = y + o1;
	vertices[20] = x + o4;
	vertices[21] = y - o1;
	vertices[22] = x - o4;
	vertices[23] = y - o1;
	const program = gl.graphicProgram.use();
	const red = (color & 0xff) / 255;
	const green = ((color >> 8) & 0xff) / 255;
	const blue = ((color >> 16) & 0xff) / 255;
	const alpha = ((color >> 24) & 0xff) / 255;
	gl.matrix
		.project(gl.flip, sr - sl, sb - st)
		.translate(-sl + sox, -st)
		.rotateAt(x, y, angle);
	gl.bindVertexArray(program.vao.a10);
	gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 24);
	gl.vertexAttrib4f(program.a_Color, red, green, blue, alpha);
	gl.drawArrays(gl.TRIANGLES, 0, 12);
};

Scene.drawRectWireframe = function (dl, dt, dr, db, ax, ay, angle) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const sox = this.scale <= 0.5 ? 0.5 : 0;
	gl.matrix
		.reset()
		.translate(-sl + sox, -st)
		.rotateAt(ax, ay, angle);
	this.setRectWireframeVertices(vertices, dl, dt, dr, db, gl.matrix);
	const program = gl.graphicProgram.use();
	gl.matrix.project(gl.flip, sr - sl, sb - st);
	gl.bindVertexArray(program.vao.a10);
	gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 20);
	gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
};

Scene.drawRectWireframeOnTilemap = function (rl, rt, rw, rh, ax, ay, angle) {
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const tw = this.tileWidth;
	const th = this.tileHeight;
	const sl = this.scrollLeft;
	const st = this.scrollTop;
	const sr = this.scrollRight;
	const sb = this.scrollBottom;
	const dl = rl;
	const dt = rt;
	const dr = rl + rw;
	const db = rt + rh;
	const sox = this.scale <= 0.5 ? 0.5 : 0;
	gl.matrix
		.reset()
		.translate(-sl + sox, -st)
		.scale(tw, th)
		.rotateAt(ax, ay, angle);
	this.setRectWireframeVertices(vertices, dl, dt, dr, db, gl.matrix);
	const program = gl.graphicProgram.use();
	gl.matrix.project(gl.flip, sr - sl, sb - st);
	gl.bindVertexArray(program.vao.a10);
	gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 20);
	gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
};

Scene.setRectWireframeVertices = function (vertices, dl, dt, dr, db, matrix) {
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x1 = a * dl + c * dt + e;
	const y1 = b * dl + d * dt + f;
	const x2 = a * dl + c * db + e;
	const y2 = b * dl + d * db + f;
	const x3 = a * dr + c * db + e;
	const y3 = b * dr + d * db + f;
	const x4 = a * dr + c * dt + e;
	const y4 = b * dr + d * dt + f;
	const vectors = Vector.instances;
	const vector14 = vectors[0].set(x4 - x1, y4 - y1);
	const vector12 = vectors[1].set(x2 - x1, y2 - y1);
	const vector21 = vectors[2].set(x1 - x2, y1 - y2);
	const vector23 = vectors[3].set(x3 - x2, y3 - y2);
	const vector32 = vectors[4].set(x2 - x3, y2 - y3);
	const vector34 = vectors[5].set(x4 - x3, y4 - y3);
	const vector43 = vectors[6].set(x3 - x4, y3 - y4);
	const vector41 = vectors[7].set(x1 - x4, y1 - y4);
	const vector1 = vector14.normalize().add(vector12.normalize());
	const vector2 = vector21.normalize().add(vector23.normalize());
	const vector3 = vector32.normalize().add(vector34.normalize());
	const vector4 = vector43.normalize().add(vector41.normalize());
	const offset = Math.max(1, 0.5 / this.scale);
	vector1.length = offset / vector1.sin(vector12);
	vector2.length = offset / vector2.sin(vector23);
	vector3.length = offset / vector3.sin(vector34);
	vector4.length = offset / vector4.sin(vector41);
	vertices[0] = x1 - vector1.x;
	vertices[1] = y1 - vector1.y;
	vertices[2] = x1 + vector1.x;
	vertices[3] = y1 + vector1.y;
	vertices[4] = x2 - vector2.x;
	vertices[5] = y2 - vector2.y;
	vertices[6] = x2 + vector2.x;
	vertices[7] = y2 + vector2.y;
	vertices[8] = x3 - vector3.x;
	vertices[9] = y3 - vector3.y;
	vertices[10] = x3 + vector3.x;
	vertices[11] = y3 + vector3.y;
	vertices[12] = x4 - vector4.x;
	vertices[13] = y4 - vector4.y;
	vertices[14] = x4 + vector4.x;
	vertices[15] = y4 + vector4.y;
	vertices[16] = x1 - vector1.x;
	vertices[17] = y1 - vector1.y;
	vertices[18] = x1 + vector1.x;
	vertices[19] = y1 + vector1.y;
};
