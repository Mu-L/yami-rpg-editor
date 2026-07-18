'use strict'
import { Data } from '../data/data-object.js'
import { File } from '../file/file-system-core.js'
import { Inspector } from '../inspector/inspector.js'
import { Updater } from './updater.js'

// 更新动画数据
Updater.updateAnimations = function (verNum) {
	// 更新到1.0.37版本：添加精灵帧anchorX, anchorY, pivotX, pivotY属性
	if (verNum < Updater.getVersionNumber('1.0.37')) {
		const keys = Object.keys(Inspector.animSpriteFrame.create())
		// 更新图层中的精灵帧
		const update = (layers) => {
			for (const layer of layers) {
				switch (layer.class) {
					case 'joint':
						update(layer.children)
						continue
					case 'sprite': {
						const frames = layer.frames
						const length = frames.length
						for (let i = 0; i < length; i++) {
							const sFrame = frames[i]
							const dFrame = Inspector.animSpriteFrame.create()
							// 默认锚点和轴点有可能被修改，还是重新设置一下
							dFrame.anchorX = 0.5
							dFrame.anchorY = 0.5
							dFrame.pivotX = 0
							dFrame.pivotY = 0
							for (const key of keys) {
								if (key in sFrame) {
									dFrame[key] = sFrame[key]
								}
							}
							frames[i] = dFrame
						}
						continue
					}
				}
			}
		}
		for (const [guid, animation] of Object.entries(Data.animations)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			for (const motion of animation.motions) {
				for (const dirCase of motion.dirCases) {
					update(dirCase.layers)
				}
			}
			File.planToSave(meta)
		}
	}
	// 更新到1.0.139版本：添加粒子层order属性
	if (verNum < Updater.getVersionNumber('1.0.139')) {
		const keys = Object.keys(Inspector.animParticleLayer.create())
		// 更新图层中的精灵帧
		const update = (layers) => {
			const length = layers.length
			for (let i = 0; i < length; i++) {
				const sLayer = layers[i]
				switch (sLayer.class) {
					case 'joint':
						update(sLayer.children)
						continue
					case 'particle': {
						const dLayer = Inspector.animParticleLayer.create()
						for (const key of keys) {
							if (key in sLayer) {
								dLayer[key] = sLayer[key]
							}
						}
						layers[i] = dLayer
						continue
					}
				}
			}
		}
		for (const [guid, animation] of Object.entries(Data.animations)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			for (const motion of animation.motions) {
				for (const dirCase of motion.dirCases) {
					update(dirCase.layers)
				}
			}
			File.planToSave(meta)
		}
	}
}
