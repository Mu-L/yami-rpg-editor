import { Particle } from './particle-window.js'

// ******************************** 粒子发射器类 ********************************

Particle.Emitter = class ParticleEmitter {
	alwaysEmit //:boolean
	visible //:boolean
	anchorY //:number
	data //:object
	startX //:number
	startY //:number
	angle //:number
	scale //:number
	speed //:number
	opacity //:number
	matrix //:object
	layers //:array

	constructor(data) {
		let alwaysEmit = false
		const sLayers = data.layers
		const sLength = sLayers.length
		const dLayers = new Array(sLength)
		for (let i = 0; i < sLength; i++) {
			const sLayer = sLayers[i]
			// 如果有一个粒子层的发射区域是屏幕边缘，设为总是发射和绘制
			if (sLayer.area.type === 'edge') {
				alwaysEmit = true
			}
			dLayers[i] = new Particle.Layer(this, sLayers[i])
		}
		this.alwaysEmit = alwaysEmit
		this.visible = false
		this.anchorY = 0
		this.data = data
		this.startX = 0
		this.startY = 0
		this.angle = 0
		this.scale = 1
		this.speed = 1
		this.opacity = 1
		this.matrix = null
		this.layers = dLayers
	}

	// 计算发射器外部矩形
	calculateOuterRect() {
		let L = Infinity
		let T = Infinity
		let R = -Infinity
		let B = -Infinity
		for (const { area } of this.data.layers) {
			switch (area.type) {
				case 'edge':
					continue
				case 'point':
					L = Math.min(L, area.x)
					T = Math.min(T, area.y)
					R = Math.max(R, area.x)
					B = Math.max(B, area.y)
					break
				case 'rectangle':
					L = Math.min(L, area.x - area.width * 0.5)
					T = Math.min(T, area.y - area.height * 0.5)
					R = Math.max(R, area.x + area.width * 0.5)
					B = Math.max(B, area.y + area.height * 0.5)
					continue
				case 'circle':
					L = Math.min(L, area.x - area.radius)
					T = Math.min(T, area.y - area.radius)
					R = Math.max(R, area.x + area.radius)
					B = Math.max(B, area.y + area.radius)
					continue
			}
		}
		// 最小外部矩形宽度32
		if (L > R) {
			L = R = 0
		} else if (R - L < 32) {
			const padding = 32 - (R - L)
			L += -padding >> 1
			R += +padding >> 1
		}
		// 最小外部矩形高度32
		if (T > B) {
			T = B = 0
		} else if (B - T < 32) {
			const padding = 32 - (B - T)
			T += -padding >> 1
			B += +padding >> 1
		}
		return {
			left: L,
			top: T,
			right: R,
			bottom: B,
			width: R - L,
			height: B - T,
			hasArea: L !== R && T !== B
		}
	}

	// 获取图层
	getLayer(layerData) {
		for (const layer of this.layers) {
			if (layer.data === layerData) {
				return layer
			}
		}
	}

	// 更新图层
	updateLayers() {
		const map = new Map()
		for (const layer of this.layers) {
			map.set(layer.data, layer)
		}
		const sLayers = this.data.layers
		const sLength = sLayers.length
		const dLayers = new Array(sLength)
		for (let i = 0; i < sLength; i++) {
			const sLayer = sLayers[i]
			let dLayer = map.get(sLayer)
			if (dLayer) map.delete(sLayer)
			else dLayer = new Particle.Layer(this, sLayer)
			dLayers[i] = dLayer
		}
		// 销毁已经不存在的图层
		for (const entries of map) {
			entries[1].destroy()
		}
		this.layers = dLayers
	}

	// 更新数据
	update(deltaTime) {
		this.emitParticles(deltaTime)
		this.updateParticles(deltaTime)
	}

	// 发射粒子
	emitParticles(deltaTime) {
		for (const layer of this.layers) {
			layer.emitParticles(deltaTime)
		}
	}

	// 更新粒子
	updateParticles(deltaTime) {
		let count = 0
		for (const layer of this.layers) {
			count += layer.updateParticles(deltaTime)
		}
		return count
	}

	// 绘制粒子
	draw(opacity) {
		for (const layer of this.layers) {
			layer.draw(opacity)
		}
	}

	// 更新过渡映射表
	updateEasing() {
		for (const layer of this.layers) {
			layer.updateEasing()
		}
	}

	// 判断是否为空
	isEmpty() {
		for (const { elements } of this.layers) {
			if (elements.count !== 0) {
				return false
			}
		}
		return true
	}

	// 清除粒子元素
	clear() {
		for (const layer of this.layers) {
			layer.clear()
		}
	}

	// 销毁资源
	destroy() {
		for (const layer of this.layers) {
			layer.destroy()
		}
	}
}
