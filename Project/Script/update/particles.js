'use strict'

// 更新粒子数据
Updater.updateParticles = function (verNum) {
	// 更新到1.0.95版本：[min, max]参数换算成[std, dev]
	if (verNum < Updater.getVersionNumber('1.0.95')) {
		// 转换[min, max]到[std, dev]
		const convert = (array) => {
			const min = array[0]
			const max = array[1]
			const std = Math.roundTo((min + max) / 2, 4)
			const dev = Math.roundTo(Math.abs(std - min), 4)
			array[0] = std
			array[1] = dev
		}
		for (const [guid, particle] of Object.entries(Data.particles)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			for (const layer of particle.layers) {
				convert(layer.anchor.x)
				convert(layer.anchor.y)
				convert(layer.anchor.speedX)
				convert(layer.anchor.speedY)
				convert(layer.movement.angle)
				convert(layer.movement.speed)
				convert(layer.movement.accelAngle)
				convert(layer.movement.accel)
				convert(layer.rotation.angle)
				convert(layer.rotation.speed)
				convert(layer.rotation.accel)
				convert(layer.hRotation.radius)
				convert(layer.hRotation.expansionSpeed)
				convert(layer.hRotation.expansionAccel)
				convert(layer.hRotation.angle)
				convert(layer.hRotation.angularSpeed)
				convert(layer.hRotation.angularAccel)
				convert(layer.scale.factor)
				convert(layer.scale.speed)
				convert(layer.scale.accel)
			}
			File.planToSave(meta)
		}
	}
	// 更新到1.0.122版本
	// 删除hframes|vframes属性
	// 添加sprite属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const keys = Object.keys(Inspector.particleLayer.create())
		for (const [guid, particle] of Object.entries(Data.particles)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const layers = particle.layers
			for (let i = 0; i < layers.length; i++) {
				const sLayer = layers[i]
				const dLayer = Inspector.particleLayer.create()
				for (const key of keys) {
					if (key in sLayer) {
						dLayer[key] = sLayer[key]
						continue
					}
					switch (key) {
						case 'sprite':
							if (typeof sLayer.hframes === 'number') {
								dLayer[key].hframes = sLayer.hframes
							}
							if (typeof sLayer.vframes === 'number') {
								dLayer[key].vframes = sLayer.vframes
							}
							continue
					}
				}
				layers[i] = dLayer
			}
			File.planToSave(meta)
		}
	}
}
