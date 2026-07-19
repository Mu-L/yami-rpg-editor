import { clipboard } from 'electron'
import { ctrl } from '../util/event-accessors.js'
import { Data } from '../data/data-object.js'
import { File } from '../file/file-system-core.js'
import { Inspector } from '../inspector/inspector.js'
import { Browser } from '../browser/project-browser.js'
import { Menu } from '../components/menu-list.js'
import { Directory } from '../file/directory-object.js'
import { FileItem } from '../file/file-item.js'
import { Reference } from '../log/related-references.js'
import { Palette } from '../palette/palette.js'
import { ObjectFolder } from './default-object-folder.js'
import { SceneShift } from './move-scene.js'
import { Scene } from './scene-window.js'
import { Title } from '../title/title-bar.js'
import { Local } from '../tools/localization.js'
import { Cursor } from '../tools/pointer-object.js'
// WebGL - 上下文恢复事件
Scene.webglRestored = function (event) {
	if (Scene.state === 'open') {
		Scene.requestRendering()
	}
}

// 窗口 - 调整大小事件
Scene.windowResize = function (event) {
	this.updateHead()
	if (this.state === 'open') {
		this.resize()
		this.requestRendering()
	}
}.bind(Scene)

// 主题改变事件
Scene.themechange = function (event) {
	this.requestRendering()
}.bind(Scene)

// 设备像素比改变事件
Scene.dprchange = function (event) {
	if (this.state === 'open') {
		this.updateFont()
	}
}.bind(Scene)

// 数据改变事件
Scene.datachange = function (event) {
	if (this.state === 'open') {
		switch (event.key) {
			case 'config':
				this.updateAnimationInterval()
				this.updateLightAreaExpansion(event.last.lightArea)
				break
			case 'teams':
				this.updateActorTeams()
				break
		}
	}
}.bind(Scene)

// 键盘按下事件
Scene.keydown = function (event) {
	if (Scene.state === 'open' && Scene.dragging === null) {
		if (event.cmdOrCtrlKey) {
			return
		} else if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					Scene.switchSettings()
					break
			}
		} else {
			switch (event.code) {
				case 'Escape':
					Scene.closeTilemap()
					break
				case 'Backquote':
					Scene.layer !== 'object'
						? Scene.switchLayer('object')
						: Scene.switchLayer('terrain')
					break
				case 'Digit1':
					Scene.openTilemap(Scene.tilemaps.shortcuts[1])
					break
				case 'Digit2':
					Scene.openTilemap(Scene.tilemaps.shortcuts[2])
					break
				case 'Digit3':
					Scene.openTilemap(Scene.tilemaps.shortcuts[3])
					break
				case 'Digit4':
					Scene.openTilemap(Scene.tilemaps.shortcuts[4])
					break
				case 'Digit5':
					Scene.openTilemap(Scene.tilemaps.shortcuts[5])
					break
				case 'Digit6':
					Scene.openTilemap(Scene.tilemaps.shortcuts[6])
					break
				case 'KeyQ':
					Scene.switchBrush('eraser')
					break
				case 'KeyE':
					Scene.switchBrush('pencil')
					break
				case 'KeyR':
					Scene.switchBrush('rect')
					break
				case 'KeyT':
					Scene.switchBrush('oval')
					break
				case 'KeyY':
					Scene.switchBrush('fill')
					break
			}
		}
	}
}

// 头部 - 指针按下事件
Scene.headPointerdown = function (event) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault()
		if (document.activeElement !== Scene.screen) {
			Scene.screen.focus()
		}
	}
}

// 开关 - 指针按下事件
Scene.switchPointerdown = function (event) {
	switch (event.button) {
		case 0: {
			const element = event.target
			if (element.tagName === 'ITEM') {
				switch (element.getAttribute('value')) {
					case 'grid':
						return Scene.switchGrid()
					case 'light':
						return Scene.switchLight()
					case 'animation':
						return Scene.switchAnimation()
					case 'settings':
						return Scene.switchSettings()
				}
			}
			break
		}
	}
}

// 图层 - 指针按下事件
Scene.layerPointerdown = function (event) {
	switch (event.button) {
		case 0:
			if (!Scene.dragging) {
				const element = event.target
				if (
					element.tagName === 'ITEM' &&
					!element.hasClass('selected')
				) {
					const value = element.getAttribute('value')
					switch (value) {
						case 'object':
						case 'terrain':
							Scene.switchLayer(value)
							break
						default:
							Scene.openTilemap(Scene.tilemaps.shortcuts[value])
							break
					}
				}
			}
			break
	}
}

// 笔刷 - 指针按下事件
Scene.brushPointerdown = function (event) {
	switch (event.button) {
		case 0:
			if (!Scene.dragging) {
				const element = event.target
				if (
					element.tagName === 'ITEM' &&
					!element.hasClass('selected')
				) {
					Scene.switchBrush(element.getAttribute('value'))
				}
			}
			break
	}
}

// 缩放 - 获得焦点事件
Scene.zoomFocus = function (event) {
	Scene.screen.focus()
}

// 缩放 - 输入事件
Scene.zoomInput = function (event) {
	Scene.setZoom(this.read())
}

// 屏幕 - 键盘按下事件
Scene.screenKeydown = function (event) {
	if (
		this.state === 'open' &&
		(this.dragging === null || event.code === 'ShiftLeft')
	) {
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy()
					this.delete()
					break
				case 'KeyC':
					this.copy()
					break
				case 'KeyV':
					this.paste()
					break
				case 'KeyD':
					this.duplicate()
					break
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					if (
						this.layer === 'object' &&
						(this.target?.class === 'actor' ||
							this.target?.class === 'animation')
					) {
						let angle
						switch (event.code) {
							case 'ArrowLeft':
								angle = 180
								break
							case 'ArrowUp':
								angle = 270
								break
							case 'ArrowRight':
								angle = 0
								break
							case 'ArrowDown':
								angle = 90
								break
						}
						this.redirectTarget(angle)
					}
					break
			}
		} else if (event.altKey) {
			return
		} else {
			switch (event.code) {
				case 'ShiftLeft':
					// 切换到初始图块帧
					if (!this.shiftKey) {
						this.shiftKey = true
						if (this.dragging) {
							switch (this.dragging.mode) {
								case 'pencil':
								case 'rect':
								case 'oval': {
									const marquee = this.marquee
									this.edit(
										marquee.x,
										marquee.y,
										marquee.width,
										marquee.height
									)
									break
								}
								case 'object-move':
									this.pointermove(this.dragging.latest)
									break
							}
						}
						window.on('keyup', this.shiftKeyup)
					}
					break
				case 'Enter':
				case 'NumpadEnter':
					if (this.target) {
						this.listOpen({ value: this.target })
					}
					break
				case 'Slash':
					this.toggle()
					break
				case 'Delete':
					this.delete()
					break
				case 'Escape':
					this.setTarget(null)
					break
				case 'KeyA':
					if ((this.translationKey & 0b0001) === 0) {
						this.translationKey |= 0b0001
						this.translationTimer.add()
						this.screen.beginScrolling()
						window.on('keyup', this.translationKeyup)
					}
					break
				case 'KeyW':
					if ((this.translationKey & 0b0010) === 0) {
						this.translationKey |= 0b0010
						this.translationTimer.add()
						this.screen.beginScrolling()
						window.on('keyup', this.translationKeyup)
					}
					break
				case 'KeyD':
					if ((this.translationKey & 0b0100) === 0) {
						this.translationKey |= 0b0100
						this.translationTimer.add()
						this.screen.beginScrolling()
						window.on('keyup', this.translationKeyup)
					}
					break
				case 'KeyS':
					if ((this.translationKey & 0b1000) === 0) {
						this.translationKey |= 0b1000
						this.translationTimer.add()
						this.screen.beginScrolling()
						window.on('keyup', this.translationKeyup)
					}
					break
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					if (this.layer === 'object') {
						event.preventDefault()
						const width = this.width
						const height = this.height
						const shift = this.shiftKey
						let offsetX = 0
						let offsetY = 0
						switch (event.code) {
							case 'ArrowLeft':
								offsetX = shift ? -0.1 : -1
								break
							case 'ArrowUp':
								offsetY = shift ? -0.1 : -1
								break
							case 'ArrowRight':
								offsetX = shift ? +0.1 : +1
								break
							case 'ArrowDown':
								offsetY = shift ? +0.1 : +1
								break
						}
						switch (this.target?.class) {
							case 'actor': {
								const actor = this.target
								const size = actor.data?.size ?? 1
								const radius = Math.max(size, 1) / 2
								const x = Math.clamp(
									actor.x + offsetX,
									radius,
									width - radius
								)
								const y = Math.clamp(
									actor.y + offsetY,
									radius,
									height - radius
								)
								this.shiftTarget(
									Math.roundTo(x, 4),
									Math.roundTo(y, 4)
								)
								break
							}
							case 'region': {
								const region = this.target
								const rwh = region.width / 2
								const rhh = region.height / 2
								const x = Math.clamp(
									region.x + offsetX,
									rwh,
									width - rwh
								)
								const y = Math.clamp(
									region.y + offsetY,
									rhh,
									height - rhh
								)
								this.shiftTarget(
									Math.roundTo(x, 4),
									Math.roundTo(y, 4)
								)
								break
							}
							case 'tilemap':
							case 'light':
							case 'animation':
							case 'particle':
							case 'parallax': {
								const target = this.target
								const x = Math.clamp(
									target.x + offsetX,
									0,
									width
								)
								const y = Math.clamp(
									target.y + offsetY,
									0,
									height
								)
								this.shiftTarget(
									Math.roundTo(x, 4),
									Math.roundTo(y, 4)
								)
								break
							}
						}
					}
					break
				case 'Minus':
				case 'NumpadSubtract':
					this.setZoom(this.zoom - 1)
					break
				case 'Equal':
				case 'NumpadAdd':
					this.setZoom(this.zoom + 1)
					break
				case 'Digit0':
				case 'Numpad0':
					this.setZoom(2)
					break
			}
		}
	}
}.bind(Scene)

// Shift键弹起事件
Scene.shiftKeyup = function (event) {
	if (!this.shiftKey) {
		return
	}
	switch (event?.code) {
		case 'ShiftLeft':
		case undefined:
			if (this.shiftKey) {
				this.shiftKey = false
				if (this.dragging) {
					switch (this.dragging.mode) {
						case 'pencil':
						case 'rect':
						case 'oval': {
							const marquee = this.marquee
							this.edit(
								marquee.x,
								marquee.y,
								marquee.width,
								marquee.height
							)
							break
						}
						case 'object-move':
							this.pointermove(this.dragging.latest)
							break
					}
				}
				window.off('keyup', this.shiftKeyup)
			}
			break
	}
}.bind(Scene)

// 位移键弹起事件
Scene.translationKeyup = function (event) {
	if (this.translationKey === 0b0000) {
		return
	}
	if (event === undefined) {
		this.translationKey = 0b0000
	} else {
		switch (event.code) {
			case 'KeyA':
				this.translationKey &= 0b1110
				break
			case 'KeyW':
				this.translationKey &= 0b1101
				break
			case 'KeyD':
				this.translationKey &= 0b1011
				break
			case 'KeyS':
				this.translationKey &= 0b0111
				break
		}
	}
	if (this.translationKey === 0b0000) {
		this.translationTimer.remove()
		this.screen.endScrolling()
		window.off('keyup', this.translationKeyup)
	}
}.bind(Scene)

// 屏幕 - 鼠标滚轮事件
Scene.screenWheel = function (event) {
	if (this.state === 'open' && this.dragging === null) {
		event.preventDefault()
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1
			this.setZoom(this.zoom + step)
		}
	}
}.bind(Scene)

// 屏幕 - 用户滚动事件
Scene.screenUserscroll = function (event) {
	if (this.state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft
		this.screen.rawScrollTop = this.screen.scrollTop
		this.updateTransform()
		this.requestRendering()
		this.marquee.resize()
		this.screen.updateScrollbars()
	}
}.bind(Scene)

// 屏幕 - 失去焦点事件
Scene.screenBlur = function (event) {
	this.shiftKeyup()
	this.translationKeyup()
	this.pointerup()
	// this.marqueePointerleave()
}.bind(Scene)

// 屏幕 - 拖拽进入事件
Scene.screenDragenter = function (event) {
	const file = Browser.body.activeFile
	switch (file?.type) {
		case 'actor':
		case 'animation':
		case 'particle':
			Scene.createPreviewObject(file)
			Scene.screenDragover.call(this, event)
	}
}

// 屏幕 - 拖拽离开事件
Scene.screenDragleave = function (event) {
	if (!this.contains(event.relatedTarget)) {
		Scene.deletePreviewObject()
	}
}

// 屏幕 - 拖拽悬停事件
Scene.screenDragover = function (event) {
	if (Scene.previewObject) {
		event.dataTransfer.dropEffect = 'move'
		event.preventDefault()
		const integer = !event.shiftKey
		const object = Scene.previewObject
		let { x, y } = Scene.getTileCoords(event, integer)
		if (integer) {
			x += 0.5
			y += 0.5
		}
		if (object.x !== x || object.y !== y) {
			object.x = x
			object.y = y
			Scene.requestRendering()
		}
	}
}

// 屏幕 - 拖拽施放事件
Scene.screenDrop = function (event) {
	if (Scene.previewObject) {
		const kind = Scene.previewObject.class
		const folder = Scene.getDefaultObjectFolder(kind)
		const fn = Scene.loadObjectContext
		Scene.loadObjectContext = Function.empty
		Scene.list.addNodeTo(Scene.previewObject, folder)
		Scene.loadObjectContext = fn
		Scene.previewObject = null
	}
}

// 选框 - 指针按下事件
Scene.marqueePointerdown = function (event) {
	if (this.dragging) {
		return
	}
	switch (event.button) {
		case 0: {
			if (event.dragKey) {
				this.dragging = event
				event.mode = 'scroll'
				event.scrollLeft = this.screen.scrollLeft
				event.scrollTop = this.screen.scrollTop
				this.marquee.clear()
				Cursor.open('cursor-grab')
				window.on('pointerup', this.pointerup)
				window.on('pointermove', this.pointermove)
				return
			}
			const marquee = this.marquee
			switch (this.layer) {
				case 'tilemap':
				case 'terrain': {
					const { x, y } = this.getTileCoords(event, true)
					const context = this.tilemap ?? this
					const mx = x + marquee.offsetX
					const my = y + marquee.offsetY
					const mw = marquee.width
					const mh = marquee.height
					const sw = context.width
					const sh = context.height
					this.patternOriginX = mx
					this.patternOriginY = my
					this.beginMapRecord()
					switch (this.brush) {
						case 'eraser':
						case 'pencil':
							if (
								mx + mw > 0 &&
								mx < sw &&
								my + mh > 0 &&
								my < sh
							) {
								this.dragging = event
								event.mode = this.brush
								event.pointerdownX = x
								event.pointerdownY = y
								window.on('pointerup', this.pointerup)
								window.on('pointermove', this.pointermove)
								marquee.selectInPencilMode(mx, my)
								this.edit(
									marquee.x,
									marquee.y,
									marquee.width,
									marquee.height
								)
							}
							break
						case 'rect':
						case 'oval':
							if (
								mx + mw > 0 &&
								mx < sw &&
								my + mh > 0 &&
								my < sh
							) {
								const width = 1
								const height = 1
								this.dragging = event
								event.mode = this.brush
								event.pointerdownX = x
								event.pointerdownY = y
								window.on('pointerup', this.pointerup)
								window.on('pointermove', this.pointermove)
								marquee.save()
								marquee.selectInRectMode(x, y, width, height)
								this.edit(
									marquee.x,
									marquee.y,
									marquee.width,
									marquee.height
								)
							}
							break
						case 'fill':
							if (x >= 0 && x < sw && y >= 0 && y < sh) {
								marquee.selectInPencilMode(mx, my)
								this.edit(x, y)
								this.saveMapRecord()
							}
							break
					}
					break
				}
				case 'object': {
					const { x, y } = this.getTileCoords(event)
					let object
					if (event.cmdOrCtrlKey) {
						switch (this.target?.class) {
							case 'tilemap':
							case 'actor':
							case 'region':
							case 'light':
							case 'animation':
							case 'particle':
							case 'parallax':
								object = this.target
								break
						}
					}
					if (object === undefined) {
						object = this.selectObject(x, y)
					}
					if (object) {
						this.dragging = event
						event.mode = 'object-move'
						event.enabled = false
						event.latest = event
						event.startX = object.x
						event.startY = object.y
						event.pointerdownX = x
						event.pointerdownY = y
						window.on('pointerup', this.pointerup)
						window.on('pointermove', this.pointermove)
						this.screen.addScrollListener(
							'both',
							this.scale / 2,
							false,
							() => {
								this.screen.beginScrolling()
								this.screen.rawScrollLeft =
									this.screen.scrollLeft
								this.screen.rawScrollTop = this.screen.scrollTop
								this.updateTransform()
								this.requestRendering()
								this.screen.updateScrollbars()
								this.pointermove(event.latest)
							}
						)
					}
					this.setTarget(object)
					break
				}
			}
			break
		}
		case 1:
		case 4:
			this.dragging = event
			event.mode = 'scroll'
			event.scrollLeft = this.screen.scrollLeft
			event.scrollTop = this.screen.scrollTop
			this.marquee.clear()
			Cursor.open('cursor-grab')
			window.on('pointerup', this.pointerup)
			window.on('pointermove', this.pointermove)
			break
		case 2: {
			const marquee = this.marquee
			switch (this.layer) {
				case 'object':
					this.dragging = event
					event.mode = 'ready-to-scroll'
					event.scrollLeft = this.screen.scrollLeft
					event.scrollTop = this.screen.scrollTop
					window.on('pointerup', this.pointerup)
					window.on('pointermove', this.pointermove)
					break
				case 'tilemap': {
					const { x, y } = this.getTileCoords(event, true)
					const context = this.tilemap ?? this
					const sw = context.width
					const sh = context.height
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (this.brush === 'eraser') {
							this.switchBrush('pencil')
						}
						this.dragging = event
						event.mode = 'copy'
						event.pointerdownX = x
						event.pointerdownY = y
						window.on('pointerup', this.pointerup)
						window.on('pointermove', this.pointermove)
						marquee.selectInCopyMode(x, y, 1, 1)
					}
					break
				}
				case 'terrain':
					this.switchTerrain()
					break
			}
			break
		}
		case 3:
			switch (this.layer) {
				case 'tilemap':
					Palette.flipTiles()
					break
			}
			break
	}
}.bind(Scene)

// 选框 - 指针移动事件
Scene.marqueePointermove = function (event) {
	const marquee = this.marquee
	if (!this.dragging) {
		marquee.pointerevent = event
		switch (this.layer) {
			case 'tilemap':
			case 'terrain': {
				const { x, y } = this.getTileCoords(event, true)
				const context = this.tilemap ?? this
				const mx = x + marquee.offsetX
				const my = y + marquee.offsetY
				const mw = marquee.width
				const mh = marquee.height
				const sw = context.width
				const sh = context.height
				if (mx + mw > 0 && mx < sw && my + mh > 0 && my < sh) {
					if (
						mx !== marquee.x ||
						my !== marquee.y ||
						!marquee.visible
					) {
						marquee.selectInPencilMode(mx, my)
					}
				} else {
					marquee.clear()
				}
				break
			}
			case 'object':
				if (!this.target) {
					const { x, y } = this.getTileCoords(event, true)
					const sw = this.width
					const sh = this.height
					if (x >= 0 && x < sw && y >= 0 && y < sh) {
						if (
							x !== marquee.x ||
							y !== marquee.y ||
							!marquee.visible
						) {
							marquee.selectInObjectMode(x, y)
						}
					} else {
						marquee.clear()
					}
				}
				break
		}
	}
}.bind(Scene)

// 选框 - 指针离开事件
Scene.marqueePointerleave = function (event) {
	if (this.marquee.pointerevent !== null) {
		this.marquee.pointerevent = null
		if (
			!this.dragging &&
			!(this.layer === 'object' && this.target !== null)
		) {
			this.marquee.clear()
		}
	}
}.bind(Scene)

// 选框 - 鼠标双击事件
Scene.marqueeDoubleclick = function (event) {
	switch (this.layer) {
		case 'object':
			if (!this.target) return
			switch (this.target.class) {
				case 'tilemap':
					this.screenBlur()
					this.openTilemap(this.target)
					break
				default:
					this.screenBlur()
					this.revealTarget()
					break
			}
			break
		case 'tilemap': {
			const { x, y } = this.getTileCoords(event)
			const { width, height } = this.getGridContext()
			if (x < 0 || y < 0 || x >= width || y >= height) {
				this.screenBlur()
				this.closeTilemap()
			}
			break
		}
	}
}.bind(Scene)

// 指针弹起事件
Scene.pointerup = function (event) {
	const { dragging } = this
	if (dragging === null) {
		return
	}
	if (event === undefined) {
		event = dragging
	}
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'eraser':
			case 'pencil': {
				const marquee = this.marquee
				if (marquee.pointerevent === null) {
					marquee.clear()
				}
				this.saveMapRecord()
				break
			}
			case 'rect':
			case 'oval': {
				const marquee = this.marquee
				if (marquee.pointerevent === null) {
					marquee.clear()
				}
				marquee.restore()
				if (marquee.pointerevent !== null) {
					const coords = this.getTileCoords(event, true)
					const x = coords.x + marquee.offsetX
					const y = coords.y + marquee.offsetY
					marquee.selectInPencilMode(x, y)
				}
				this.saveMapRecord()
				break
			}
			case 'copy': {
				const marquee = this.marquee
				const coords = this.getTileCoords(event, true)
				const context = this.tilemap ?? this
				const x = Math.clamp(coords.x, 0, context.width - 1)
				const y = Math.clamp(coords.y, 0, context.height - 1)
				marquee.offsetX = marquee.x - x
				marquee.offsetY = marquee.y - y
				if (marquee.pointerevent !== null) {
					marquee.selectInPencilMode()
				} else {
					marquee.clear()
				}
				Palette.copyTilesFromScene(
					marquee.x,
					marquee.y,
					marquee.width,
					marquee.height
				)
				break
			}
			case 'object-move':
				this.screen.endScrolling()
				this.screen.removeScrollListener()
				break
			case 'ready-to-scroll':
				if (event.target === this.marquee) {
					const { x, y } = this.getTileCoords(event)
					const object = this.selectObject(x, y)
					this.setTarget(object)
					this.menuPopup(event)
				}
				break
			case 'scroll':
				this.screen.endScrolling()
				Cursor.close('cursor-grab')
				break
		}
		this.dragging = null
		window.off('pointerup', this.pointerup)
		window.off('pointermove', this.pointermove)
	}
}.bind(Scene)

// 指针移动事件
Scene.pointermove = function (event) {
	const { dragging, marquee } = this
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'eraser':
			case 'pencil': {
				const mw = marquee.width
				const mh = marquee.height
				const ox = marquee.offsetX
				const oy = marquee.offsetY
				const coords = this.getTileCoords(event, true)
				const context = this.tilemap ?? this
				const x = Math.clamp(
					coords.x,
					1 - ox - mw,
					context.width - 1 - ox
				)
				const y = Math.clamp(
					coords.y,
					1 - oy - mh,
					context.height - 1 - oy
				)
				const mx = x + ox
				const my = y + oy
				if (mx !== marquee.x || my !== marquee.y) {
					const gapX = Math.abs(mx - marquee.x)
					const gapY = Math.abs(my - marquee.y)

					// 绘制补间图块
					if ((gapX > 1 && mw < 9) || (gapY > 1 && mh < 9)) {
						const length = Math.max(gapX, gapY)
						const actorOffsetX = (mx - marquee.x) / length
						const actorOffsetY = (my - marquee.y) / length
						for (let i = 1; i < length; i++) {
							const mx = marquee.x + Math.round(i * actorOffsetX)
							const my = marquee.y + Math.round(i * actorOffsetY)
							this.edit(mx, my, mw, mh)
						}
					}
					marquee.selectInPencilMode(mx, my)
					this.edit(mx, my, mw, mh)
				}
				break
			}
			case 'rect':
			case 'oval': {
				const coords = this.getTileCoords(event, true)
				const mx = Math.min(coords.x, dragging.pointerdownX)
				const my = Math.min(coords.y, dragging.pointerdownY)
				const mw = Math.abs(coords.x - dragging.pointerdownX) + 1
				const mh = Math.abs(coords.y - dragging.pointerdownY) + 1
				if (
					mx !== marquee.x ||
					my !== marquee.y ||
					mw !== marquee.width ||
					mh !== marquee.height
				) {
					marquee.selectInRectMode(mx, my, mw, mh)
					this.edit(mx, my, mw, mh)
				}
				break
			}
			case 'copy': {
				const coords = this.getTileCoords(event, true)
				const context = this.tilemap ?? this
				const x = Math.clamp(coords.x, 0, context.width - 1)
				const y = Math.clamp(coords.y, 0, context.height - 1)
				const mx = Math.min(x, dragging.pointerdownX)
				const my = Math.min(y, dragging.pointerdownY)
				const mw = Math.abs(x - dragging.pointerdownX) + 1
				const mh = Math.abs(y - dragging.pointerdownY) + 1
				if (
					mx !== marquee.x ||
					my !== marquee.y ||
					mw !== marquee.width ||
					mh !== marquee.height
				) {
					this.marquee.selectInCopyMode(mx, my, mw, mh)
				}
				break
			}
			case 'object-move': {
				if (!dragging.enabled) {
					const distX = event.clientX - dragging.clientX
					const distY = event.clientY - dragging.clientY
					if (
						Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
						event.timeStamp - dragging.timeStamp >= 500
					) {
						dragging.enabled = true
					} else {
						break
					}
				}
				dragging.latest = event
				const width = this.width
				const height = this.height
				const coords = this.getTileCoords(event)
				let x
				let y
				const divider = event.cmdOrCtrlKey ? 2 : 1
				switch (this.target?.class) {
					case 'actor': {
						const actor = this.target
						const size = actor.data?.size ?? 1
						const radius = Math.max(size, 1) / 2
						if (this.shiftKey) {
							x =
								dragging.startX -
								dragging.pointerdownX +
								coords.x
							y =
								dragging.startY -
								dragging.pointerdownY +
								coords.y
							x = Math.roundTo(
								Math.clamp(x, radius, width - radius),
								4
							)
							y = Math.roundTo(
								Math.clamp(y, radius, height - radius),
								4
							)
						} else {
							x =
								dragging.startX -
								Math.floor(dragging.pointerdownX * divider) /
									divider +
								Math.floor(coords.x * divider) / divider
							y =
								dragging.startY -
								Math.floor(dragging.pointerdownY * divider) /
									divider +
								Math.floor(coords.y * divider) / divider
							x = Math.clamp(x, radius, width - radius)
							y = Math.clamp(y, radius, height - radius)
						}
						this.shiftTarget(x, y)
						break
					}
					case 'region': {
						const region = this.target
						const rwh = region.width / 2
						const rhh = region.height / 2
						if (this.shiftKey) {
							x =
								dragging.startX -
								dragging.pointerdownX +
								coords.x
							y =
								dragging.startY -
								dragging.pointerdownY +
								coords.y
							x = Math.roundTo(Math.clamp(x, rwh, width - rwh), 4)
							y = Math.roundTo(
								Math.clamp(y, rhh, height - rhh),
								4
							)
						} else {
							x =
								dragging.startX -
								Math.floor(dragging.pointerdownX * divider) /
									divider +
								Math.floor(coords.x * divider) / divider
							y =
								dragging.startY -
								Math.floor(dragging.pointerdownY * divider) /
									divider +
								Math.floor(coords.y * divider) / divider
							x = Math.clamp(x, rwh, width - rwh)
							y = Math.clamp(y, rhh, height - rhh)
						}
						this.shiftTarget(x, y)
						break
					}
					case 'tilemap':
					case 'light':
					case 'animation':
					case 'particle':
					case 'parallax':
						if (this.shiftKey) {
							x =
								dragging.startX -
								dragging.pointerdownX +
								coords.x
							y =
								dragging.startY -
								dragging.pointerdownY +
								coords.y
							x = Math.roundTo(Math.clamp(x, 0, width), 4)
							y = Math.roundTo(Math.clamp(y, 0, height), 4)
						} else {
							x =
								dragging.startX -
								Math.floor(dragging.pointerdownX * divider) /
									divider +
								Math.floor(coords.x * divider) / divider
							y =
								dragging.startY -
								Math.floor(dragging.pointerdownY * divider) /
									divider +
								Math.floor(coords.y * divider) / divider
							x = Math.clamp(x, 0, width)
							y = Math.clamp(y, 0, height)
						}
						this.shiftTarget(x, y)
						break
				}
				break
			}
			case 'ready-to-scroll': {
				const distX = event.clientX - dragging.clientX
				const distY = event.clientY - dragging.clientY
				this.screen.setScroll(
					dragging.scrollLeft - distX,
					dragging.scrollTop - distY
				)
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll'
					Cursor.open('cursor-grab')
				}
				break
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX
				const distY = event.clientY - dragging.clientY
				this.screen.beginScrolling()
				this.screen.setScroll(
					dragging.scrollLeft - distX,
					dragging.scrollTop - distY
				)
				break
			}
		}
	}
}.bind(Scene)

// 菜单 - 弹出事件
Scene.menuPopup = function (event) {
	const { x, y } = this.getTileCoords(event, true)
	const isInScene = x >= 0 && x < this.width && y >= 0 && y < this.height
	if (this.target || isInScene) {
		this.translationKeyup()
		const target = this.target
		const selected = !!target
		const pastable = Clipboard.has('yami.scene.object')
		const get = Local.createGetter('menuScene')
		const menuItems = [
			{
				label: get('create'),
				enabled: isInScene,
				submenu: [
					{
						label: get('create.actor'),
						click: () => {
							this.create('actor', x + 0.5, y + 0.5)
						}
					},
					{
						label: get('create.region'),
						click: () => {
							this.create('region', x + 0.5, y + 0.5)
						}
					},
					{
						label: get('create.light'),
						click: () => {
							this.create('light', x + 0.5, y + 0.5)
						}
					},
					{
						label: get('create.animation'),
						click: () => {
							this.create('animation', x + 0.5, y + 0.5)
						}
					},
					{
						label: get('create.particle'),
						click: () => {
							this.create('particle', x + 0.5, y + 0.5)
						}
					},
					{
						label: get('create.parallax'),
						click: () => {
							this.create('parallax', x, y)
						}
					},
					{
						label: get('create.tilemap'),
						click: () => {
							this.create('tilemap', x, y)
						}
					}
				]
			},
			{
				label: get('toggle'),
				accelerator: '/',
				enabled: selected,
				click: () => {
					this.toggle()
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: selected,
				click: () => {
					this.copy()
					this.delete()
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					this.copy()
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.paste(x, y)
				}
			},
			{
				label: get('duplicate'),
				accelerator: ctrl('D'),
				enabled: selected,
				click: () => {
					this.duplicate()
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: selected,
				click: () => {
					this.delete()
				}
			},
			{
				label: get('copy-id'),
				enabled: selected,
				click: () => {
					navigator.clipboard.writeText(target.presetId)
				}
			},
			{
				label: get('find-references'),
				enabled: selected,
				click: () => {
					Reference.openRelated(target.presetId)
				}
			},
			{
				type: 'separator'
			}
		]
		switch (target?.class) {
			case 'actor':
			case 'animation': {
				// 添加编辑动画选项
				const id = target.animationId ?? target.data?.animationId
				const meta = Data.manifest.guidMap[id]
				menuItems.push({
					label: get('editAnimation'),
					enabled: !!meta,
					click: () => {
						const animFile = Directory.getFile(meta.path)
						if (animFile) {
							Title.openTab(animFile)
						}
					}
				})
				break
			}
			case 'particle': {
				// 添加编辑粒子选项
				const id = target.particleId
				const meta = Data.manifest.guidMap[id]
				menuItems.push({
					label: get('editParticle'),
					enabled: !!meta,
					click: () => {
						const particleFile = Directory.getFile(meta.path)
						if (particleFile) {
							Title.openTab(particleFile)
						}
					}
				})
				break
			}
		}
		// 添加在项目中查找选项
		const file = Scene.getObjectFile(target)
		if (file !== undefined) {
			menuItems.push({
				label: Local.get('common.findInProject'),
				enabled: file instanceof FileItem,
				click: () => {
					Scene.openFileLocation(target)
				}
			})
		}
		const { startPosition } = Data.config
		if (
			startPosition.sceneId === this.meta.guid &&
			Math.floor(startPosition.x) === x &&
			Math.floor(startPosition.y) === y
		) {
			// 添加重置初始位置选项
			menuItems.push({
				label: get('resetStartPosition'),
				click: () => {
					startPosition.sceneId = ''
					startPosition.x = 0
					startPosition.y = 0
					this.requestRendering()
					File.planToSave(Data.manifest.project.config)
				}
			})
		} else {
			// 添加设置初始位置选项
			menuItems.push({
				label: get('setStartPosition'),
				click: () => {
					const { startPosition } = Data.config
					startPosition.sceneId = this.meta.guid
					startPosition.x = x + 0.5
					startPosition.y = y + 0.5
					this.requestRendering()
					File.planToSave(Data.manifest.project.config)
				}
			})
		}
		Menu.popup(
			{
				x: event.clientX,
				y: event.clientY
			},
			menuItems
		)
	}
}

// 搜索框 - 输入事件
Scene.searcherInput = function (event) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input.value
		Scene.list.searchNodesDebounced(text)
	}
}

// 列表 - 键盘按下事件
Scene.listKeydown = function (event) {
	if (!this.data) {
		return
	}
	const item = this.read()
	const isFile = item && item.class !== 'folder'
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyX':
				if (isFile) {
					this.copy(item)
					this.delete(item)
				}
				break
			case 'KeyC':
				if (isFile) {
					this.copy(item)
				}
				break
			case 'KeyV':
				this.paste('auto')
				break
			case 'KeyD':
				this.duplicate(item)
				break
		}
	} else {
		switch (event.code) {
			case 'Slash':
				this.toggle(item)
				break
			case 'Delete':
				this.delete(item)
				break
			case 'Backspace':
				this.cancelSearch()
				break
			case 'Escape':
				Scene.setTarget(null)
				break
		}
	}
}

// 列表 - 指针按下事件
Scene.listPointerdown = function (event) {
	switch (event.button) {
		case 0: {
			const element = event.target
			switch (element.tagName) {
				case 'VISIBILITY-ICON': {
					const { item } = element.parentNode
					if (!this.canSwitchState(item)) {
						return
					}
					const { hidden } = item
					const backups = this.setRecursiveStates(
						item,
						'hidden',
						!hidden
					)
					this.updateFolderState(item.parent, 'hidden')
					this.update()
					this.dispatchChangeEvent()
					Scene.requestRendering()
					Scene.history.save({
						type: 'scene-object-hidden',
						item: item,
						oldValues: backups,
						newValue: !hidden
					})
					break
				}
				case 'LOCK-ICON': {
					const { item } = element.parentNode
					if (!this.canSwitchState(item)) {
						return
					}
					const { locked } = item
					const backups = this.setRecursiveStates(
						item,
						'locked',
						!locked
					)
					this.updateFolderState(item.parent, 'locked')
					this.update()
					this.dispatchChangeEvent()
					Scene.history.save({
						type: 'scene-object-locked',
						item: item,
						oldValues: backups,
						newValue: !locked
					})
					break
				}
			}
			break
		}
		case 3:
			this.cancelSearch()
			break
	}
}

// 列表 - 选择事件
Scene.listSelect = function (event) {
	const item = event.value
	switch (item.class) {
		case 'folder':
			Scene.setTarget(null)
			break
		case 'tilemap':
			// 正在编辑图块时直接打开瓦片地图
			// 图块组关闭时打开瓦片地图检查器
			if (Scene.tilemap) {
				if (Palette.state === 'closed') {
					Scene.setTarget(item)
				}
				Scene.openTilemap(item)
			} else {
				Scene.setTarget(item)
			}
			break
		default:
			Scene.setTarget(item)
			break
	}
}

// 列表 - 记录事件
Scene.listRecord = function (event) {
	const response = event.value
	switch (response.type) {
		case 'rename':
			Scene.listRename(response)
			break
		case 'create': {
			let parent = response.dItem
			if (parent.class !== 'folder') {
				parent = parent.parent ?? parent
			}
			this.updateFolderState(parent, 'hidden')
			this.updateFolderState(parent, 'locked')
			Scene.history.save({
				type: 'scene-object-create',
				response: response,
				parent: parent
			})
			break
		}
		case 'delete': {
			const parent = response.item.parent
			this.updateFolderState(parent, 'hidden')
			this.updateFolderState(parent, 'locked')
			Scene.history.save({
				type: 'scene-object-delete',
				response: response
			})
			break
		}
		case 'remove': {
			const sParent = response.source.parent
			const dParent = response.destination.parent
			this.updateFolderState(sParent, 'hidden')
			this.updateFolderState(sParent, 'locked')
			if (sParent !== dParent) {
				this.updateFolderState(dParent, 'hidden')
				this.updateFolderState(dParent, 'locked')
			}
			Scene.history.save({
				type: 'scene-object-remove',
				response: response
			})
			break
		}
	}
}

// 列表 - 菜单弹出事件
Scene.listPopup = function (event) {
	const item = event.value
	const menuItems = []
	const get = Local.createGetter('menuSceneList')
	let copyable
	let pastable
	let deletable
	let renamable
	if (item) {
		switch (item.class) {
			case 'folder':
				copyable = false
				break
			case 'tilemap':
				copyable = true
				menuItems.push(
					{
						label: get('edit'),
						accelerator: 'Enter',
						click: () => {
							Scene.openTilemap(item)
						}
					},
					{
						label: get('shift'),
						enabled: item.tiles.length !== 0,
						click: () => {
							SceneShift.open((x, y) => {
								Scene.history.save({
									type: 'scene-tilemap-shift',
									tilemap: item,
									shiftX: x,
									shiftY: y
								})
								Scene.shiftTilemap(item, x, y)
								Scene.planToSave()
							})
						}
					},
					{
						label: get('reveal'),
						click: () => {
							Scene.revealTarget()
						}
					},
					{
						label: get('shortcut'),
						submenu: this.createTilemapShortcutItems(item)
					}
				)
				break
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax':
				copyable = true
				menuItems.push({
					label: get('reveal'),
					accelerator: 'Enter',
					click: () => {
						Scene.revealTarget()
					}
				})
				break
		}
		pastable = Clipboard.has('yami.scene.object')
		deletable = true
		renamable = true
	} else {
		copyable = false
		pastable = Clipboard.has('yami.scene.object')
		deletable = false
		renamable = false
	}
	menuItems.push(
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.folder'),
					click: () => {
						this.addNodeTo(this.createFolder(), item)
					}
				},
				{
					label: get('create.actor'),
					click: () => {
						this.addNodeTo(Inspector.sceneActor.create(), item)
					}
				},
				{
					label: get('create.region'),
					click: () => {
						this.addNodeTo(Inspector.sceneRegion.create(), item)
					}
				},
				{
					label: get('create.light'),
					click: () => {
						this.addNodeTo(Inspector.sceneLight.create(), item)
					}
				},
				{
					label: get('create.animation'),
					click: () => {
						this.addNodeTo(Inspector.sceneAnimation.create(), item)
					}
				},
				{
					label: get('create.particle'),
					click: () => {
						this.addNodeTo(Inspector.sceneParticle.create(), item)
					}
				},
				{
					label: get('create.parallax'),
					click: () => {
						this.addNodeTo(Inspector.sceneParallax.create(), item)
					}
				},
				{
					label: get('create.tilemap'),
					click: () => {
						// 关闭图块组检查器
						Inspector.fileTileset.close()
						this.addNodeTo(
							Inspector.sceneTilemap.create(
								Scene.width,
								Scene.height
							),
							item
						)
					}
				}
			]
		},
		{
			label: get('toggle'),
			accelerator: '/',
			enabled: copyable,
			click: () => {
				this.toggle(item)
			}
		},
		{
			type: 'separator'
		},
		{
			label: get('cut'),
			accelerator: ctrl('X'),
			enabled: copyable,
			click: () => {
				this.copy(item)
				this.delete(item)
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				this.copy(item)
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste(item)
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: copyable,
			click: () => {
				this.duplicate(item)
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: deletable,
			click: () => {
				this.delete(item)
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: renamable,
			click: () => {
				this.rename(item)
			}
		},
		{
			label: get('copy-id'),
			enabled: !!item,
			click: () => {
				navigator.clipboard.writeText(item.presetId)
			}
		}
	)
	if (copyable) {
		menuItems.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			enabled: copyable,
			click: () => {
				Reference.openRelated(item.presetId)
			}
		})
	}
	// 添加在项目中查找选项
	const file = Scene.getObjectFile(item)
	if (file !== undefined) {
		menuItems.push({
			label: Local.get('common.findInProject'),
			enabled: file instanceof FileItem,
			click: () => {
				Scene.openFileLocation(item)
			}
		})
	}
	if (!item) {
		menuItems.push(
			{
				type: 'separator'
			},
			{
				label: get('shiftAll'),
				click: () => {
					SceneShift.open((x, y) => {
						const changes = Scene.computeObjectShifting(x, y)
						Scene.history.save({
							type: 'scene-shift',
							shiftX: x,
							shiftY: y,
							changes: changes
						})
						Scene.shiftTerrains(x, y)
						Scene.shiftObjects(changes)
						Scene.planToSave()
					})
				}
			},
			{
				label: get('settings'),
				click: () => {
					ObjectFolder.open()
				}
			}
		)
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		menuItems
	)
}

// 列表 - 打开事件
Scene.listOpen = function (event) {
	const item = event.value
	switch (item.class) {
		case 'tilemap':
			Scene.openTilemap(item)
			break
		case 'actor':
		case 'region':
		case 'light':
		case 'animation':
		case 'particle':
		case 'parallax':
			Scene.revealTarget()
			break
	}
}

// 列表 - 重命名事件
Scene.listRename = function (response) {
	const target = response.item
	switch (target.class) {
		case 'folder':
			Scene.history.save({
				type: 'scene-folder-rename',
				response: response
			})
			break
		default: {
			const map = Scene.inspectorTypeMap
			const key = map[target.class]
			const editor = Inspector[key]
			const input = editor.nameBox
			const { oldValue, newValue } = response
			input.write(newValue)
			Scene.updateTargetInfo()
			Scene.requestRendering()
			Scene.history.save({
				type: 'inspector-change',
				editor: editor,
				target: target,
				changes: [
					{
						input,
						oldValue,
						newValue
					}
				]
			})
			break
		}
	}
}

// 列表 - 改变事件
Scene.listChange = function (event) {
	Scene.planToSave()
}

// 列表页面 - 调整大小事件
Scene.listPageResize = function (event) {
	Scene.list.updateHead()
	Scene.list.resize()
}

import path from 'node:path'
