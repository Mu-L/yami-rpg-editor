import { Scene } from '../scene/scene-window.js'
import { GL } from '../webgl/webgl-init.js'
import { Easing } from '../data/transition-window.js'
import { Particle } from './particle-window.js'
import { ImageTexture } from '../webgl/image-texture.js'

// ******************************** 粒子图层类 ********************************

Particle.Layer = class ParticleLayer {
	emitter //:object
	data //:object
	texture //:object
	textureWidth //:number
	textureHeight //:number
	unitWidth //:number
	unitHeight //:number
	elapsed //:number
	capacity //:number
	count //:number
	stocks //:number
	elements //:array
	reserves //:array

	constructor(emitter, data) {
		this.emitter = emitter
		this.data = data
		this.texture = null
		this.textureWidth = 0
		this.textureHeight = 0
		this.unitWidth = 0
		this.unitHeight = 0
		this.elapsed = data.interval - data.delay
		this.capacity = 0
		this.count = 0
		this.stocks = 0
		this.elements = []
		this.elements.count = 0
		this.reserves = []
		this.reserves.count = 0

		// 更新发射数量
		this.updateCount()

		// 更新过渡映射表
		this.updateEasing()

		// 加载纹理
		this.loadTexture()
	}

	// 发射粒子
	emitParticles(deltaTime) {
		let stocks = this.stocks
		if (stocks === 0) return
		this.elapsed += deltaTime * this.emitter.speed
		const data = this.data
		const dInterval = data.interval
		let count = Math.floor(this.elapsed / dInterval)
		if (count > 0) {
			// 0 * Infinity returns NaN
			this.elapsed -= dInterval * count || 0
			const elements = this.elements
			const maximum = ParticleLayer.maximum
			let eCount = elements.count
			if (eCount === maximum) return
			const reserves = this.reserves
			let rCount = reserves.count
			spawn: {
				// 重用旧的粒子
				while (rCount > 0) {
					const element = reserves[--rCount]
					elements[eCount++] = element
					element.initialize()
					count--
					stocks--
					// 由于Infinity * 0返回NaN，这里分开判断
					if (count === 0 || stocks === 0) {
						break spawn
					}
				}
				// 创建新的粒子
				for (let i = this.capacity; i < maximum; i++) {
					elements[eCount++] = new Particle.Element(this)
					this.capacity = i + 1
					count--
					stocks--
					if (count === 0 || stocks === 0) {
						break spawn
					}
				}
			}
			elements.count = eCount
			reserves.count = rCount
			this.stocks = stocks
		}
	}

	// 更新粒子
	updateParticles(deltaTime) {
		const elements = this.elements
		const eCount = elements.count
		if (eCount === 0) return 0
		const reserves = this.reserves
		let rCount = reserves.count
		let offset = 0
		deltaTime *= this.emitter.speed
		for (let i = 0; i < eCount; i++) {
			const element = elements[i]
			switch (element.update(deltaTime)) {
				// 回收粒子
				case false:
					reserves[rCount + offset] = element
					offset++
					continue
				// 重新排序
				default:
					if (offset !== 0) {
						elements[i - offset] = element
					}
					continue
			}
		}
		if (offset !== 0) {
			// 为了通知动画舞台继续更新画面
			// 这里不对返回的粒子数量做更新(零粒子数停止播放)
			elements.count = eCount - offset
			reserves.count = rCount + offset
		}
		return eCount
	}

	// 绘制粒子
	draw(opacity = 1) {
		const gl = GL
		const data = this.data
		const texture = this.texture
		const elements = this.elements
		const count = elements.count
		let vi = 0
		switch (data.sort) {
			case 'youngest-in-front':
				for (let i = 0; i < count; i++) {
					elements[i].draw(vi)
					vi += 20
				}
				break
			case 'oldest-in-front':
				for (let i = count - 1; i >= 0; i--) {
					elements[i].draw(vi)
					vi += 20
				}
				break
			case 'by-scale-factor': {
				const { min, abs, round } = Math
				const layers = ParticleLayer.layers
				const starts = ParticleLayer.zeros
				const ends = ParticleLayer.sharedUint32A
				const set = ParticleLayer.sharedUint32B
				const times = 0x3ffff / 10
				let li = 0
				let si = 2
				for (let i = 0; i < count; i++) {
					const element = elements[i]
					const key = min(
						0x3ffff,
						round(abs(element.scaleFactor) * times)
					)
					if (starts[key] === 0) {
						starts[key] = si
						layers[li++] = key
					} else {
						set[ends[key] + 1] = si
					}
					ends[key] = si
					set[si++] = i
					set[si++] = 0
				}
				const queue = new Uint32Array(layers.buffer, 0, li).sort()
				for (let i = 0; i < li; i++) {
					const key = queue[i]
					let si = starts[key]
					starts[key] = 0
					do {
						elements[set[si]].draw(vi)
						vi += 20
					} while ((si = set[si + 1]) !== 0)
				}
				break
			}
		}

		// 绘制元素
		if (vi !== 0) {
			gl.alpha = this.emitter.opacity * opacity
			gl.blend = data.blend
			const program = gl.particleProgram.use()
			const vertices = gl.arrays[0].float32
			const matrix = gl.matrix
				.project(gl.flip, gl.width, gl.height)
				.multiply(Particle.Element.stage.matrix)
			gl.bindVertexArray(program.vao)
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
			switch (data.color.mode) {
				default:
					gl.uniform1i(program.u_Mode, 0)
					break
				case 'texture': {
					const tint = data.color.tint
					const red = tint[0] / 255
					const green = tint[1] / 255
					const blue = tint[2] / 255
					const gray = tint[3] / 255
					gl.uniform1i(program.u_Mode, 1)
					gl.uniform4f(program.u_Tint, red, green, blue, gray)
					break
				}
			}
			const lightMode =
				Scene.state === 'open' && Scene.showLight ? data.light : 'raw'
			gl.uniform1i(
				program.u_LightMode,
				ParticleLayer.lightSamplingModes[lightMode]
			)
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi)
			gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture)
			gl.drawElements(gl.TRIANGLES, (vi / 20) * 6, gl.UNSIGNED_INT, 0)
			// 重置混合模式
			gl.alpha = 1
			gl.blend = 'normal'
		}
	}

	// 加载粒子纹理
	loadTexture() {
		const guid = this.data.image
		const texture = this.texture
		if (texture instanceof ImageTexture) {
			if (texture.complete && texture.base.guid === guid) {
				this.calculateElementSize()
				return
			}
			texture.destroy()
			this.texture = null
			this.unitWidth = 0
			this.unitHeight = 0
		}
		if (guid) {
			const texture = new ImageTexture(guid)
			if (texture.complete) {
				this.texture = texture
				this.calculateElementSize()
				Particle.Element.stage.requestRendering()
				delete this.draw
				return
			}
			this.texture = texture
			texture.on('load', () => {
				if (this.texture === texture) {
					this.texture = texture
					this.calculateElementSize()
					Particle.Element.stage.requestRendering()
					delete this.draw
				} else {
					texture.destroy()
				}
			})
		}
		this.draw = Function.empty
	}

	// 计算粒子元素大小
	calculateElementSize() {
		const { data, texture } = this
		if (!texture) return
		this.textureWidth = texture.width
		this.textureHeight = texture.height
		this.unitWidth = Math.floor(texture.width / data.sprite.hframes)
		this.unitHeight = Math.floor(texture.height / data.sprite.vframes)
	}

	// 调整元素索引
	resizeElementIndices() {
		const sprite = this.data.sprite
		const hframes = sprite.hframes
		const vframes = sprite.vframes
		const elements = this.elements
		const count = elements.count
		for (let i = 0; i < count; i++) {
			const element = elements[i]
			element.spriteX %= hframes
			element.spriteY %= vframes
		}
	}

	// 更新发射数量
	updateCount() {
		let { count } = this.data
		if (count === 0) {
			count = 1e16
		}
		this.count = count
		this.stocks = count
	}

	// 更新过渡映射表
	updateEasing() {
		const { color } = this.data
		if (color.mode === 'easing') {
			this.easing = Easing.get(color.easingId)
		}
	}

	// 更新元素方法
	updateElementMethods() {
		this.clear()
		const reserves = this.reserves
		const count = reserves.count
		for (let i = 0; i < count; i++) {
			reserves[i].updateMethods()
		}
	}

	// 清除粒子元素
	clear() {
		const elements = this.elements
		const reserves = this.reserves
		const eCount = elements.count
		let rCount = reserves.count
		for (let i = 0; i < eCount; i++) {
			reserves[rCount++] = elements[i]
		}
		elements.count = 0
		reserves.count = rCount
		this.elapsed = this.data.interval - this.data.delay
		this.stocks = this.count
	}

	// 销毁资源
	destroy() {
		if (this.texture instanceof ImageTexture) {
			this.texture.destroy()
			this.texture = null
		}
	}

	// 静态 - 同时存在的最大粒子数量
	static maximum = 1000

	// 静态 - 图层数组
	static layers = new Uint32Array(0x40000)

	// 静态 - 零值数组(用完后要确保所有值归零)
	static zeros = new Uint32Array(0x40000)

	// 静态 - 共享数组
	static get sharedUint32A() {
		if (!this._sharedUint32A) {
			this._sharedUint32A = new Uint32Array(
				GL.arrays[0].uint32.buffer,
				512 * 512 * 88,
				512 * 512
			)
		}
		return this._sharedUint32A
	}
	static get sharedUint32B() {
		if (!this._sharedUint32B) {
			this._sharedUint32B = new Uint32Array(
				GL.arrays[0].uint32.buffer,
				512 * 512 * 92,
				512 * 512
			)
		}
		return this._sharedUint32B
	}

	// 静态 - 光照采样模式映射表
	static lightSamplingModes = { raw: 0, global: 1, ambient: 2 }
}
