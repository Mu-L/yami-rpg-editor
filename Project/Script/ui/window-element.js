'use strict'
import { Timer } from '../util/timer.js'
import { UI } from './ui-window.js'
import { GL } from '../webgl/webgl-init.js'

// ******************************** 窗口元素 ********************************

UI.Window = class WindowElement extends UI.Element {
	_layout //:string
	scrollWidth //:number
	scrollHeight //:number
	_scrollX //:number
	_scrollY //:number
	gridWidth //:number
	gridHeight //:number
	gridGapX //:number
	gridGapY //:number
	paddingX //:number
	paddingY //:number
	overflow //:string
	columns //:number
	rows //:number
	proxy //:object

	constructor(data) {
		super(data)
		this.layout = data.layout
		this.scrollWidth = 0
		this.scrollHeight = 0
		this.scrollX = data.scrollX
		this.scrollY = data.scrollY
		this.gridWidth = data.gridWidth
		this.gridHeight = data.gridHeight
		this.gridGapX = data.gridGapX
		this.gridGapY = data.gridGapY
		this.paddingX = data.paddingX
		this.paddingY = data.paddingY
		this.overflow = data.overflow
		this.columns = 0
		this.rows = 0
		this.proxy = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			matrix: null,
			opacity: 0
		}
	}

	// 读取布局
	get layout() {
		return this._layout
	}

	// 写入布局
	set layout(value) {
		if (this._layout !== value) {
			this._layout = value
			switch (value) {
				case 'normal':
					delete this.resize
					break
				case 'horizontal-grid':
					this.resize = WindowElement.horizontalGridResize
					break
				case 'vertical-grid':
					this.resize = WindowElement.verticalGridResize
					break
			}
			if (this.connected) {
				this.resize()
			}
		}
	}

	// 读取滚动X
	get scrollX() {
		return this._scrollX
	}

	// 写入滚动X
	set scrollX(value) {
		const max = this.scrollWidth - this.width
		const scrollX = Math.clamp(value, 0, max)
		if (this._scrollX !== scrollX) {
			this._scrollX = scrollX
			if (this.connected) {
				this.resize()
				UI.requestRendering()
			}
		}
	}

	// 读取滚动Y
	get scrollY() {
		return this._scrollY
	}

	// 写入滚动Y
	set scrollY(value) {
		const max = this.scrollHeight - this.height
		const scrollY = Math.clamp(value, 0, max)
		if (this._scrollY !== value) {
			this._scrollY = scrollY
			if (this.connected) {
				this.resize()
				UI.requestRendering()
			}
		}
	}

	// 绘制图像
	draw() {
		switch (this.overflow) {
			case 'visible':
				this.drawChildren()
				break
			case 'hidden': {
				const matrix = GL.matrix.set(UI.matrix).multiply(this.matrix)
				const L = this.x
				const T = this.y
				const R = L + this.width
				const B = T + this.height
				const a = matrix[0]
				const b = matrix[1]
				const c = matrix[3]
				const d = matrix[4]
				const e = matrix[6]
				const f = matrix[7]
				const x1 = Math.min(
					a * L + c * T + e,
					a * L + c * B + e,
					a * R + c * B + e,
					a * R + c * T + e
				)
				const y1 = Math.min(
					b * L + d * T + f,
					b * L + d * B + f,
					b * R + d * B + f,
					b * R + d * T + f
				)
				const x2 = Math.max(
					a * L + c * T + e,
					a * L + c * B + e,
					a * R + c * B + e,
					a * R + c * T + e
				)
				const y2 = Math.max(
					b * L + d * T + f,
					b * L + d * B + f,
					b * R + d * B + f,
					b * R + d * T + f
				)
				let sl = Math.max(Math.floor(x1), 0)
				let st = Math.max(Math.floor(y1), 0)
				let sr = Math.min(Math.ceil(x2), GL.width)
				let sb = Math.min(Math.ceil(y2), GL.height)
				let sw = sr - sl
				let sh = sb - st
				if (sw > 0 && sh > 0) {
					const wasEnabled = GL.isEnabled(GL.SCISSOR_TEST)
					let prevBox = null
					// 计算当前裁剪框(以左下角为原点)
					let nx = sl
					let ny = GL.height - sb
					let nw = sw
					let nh = sh
					if (wasEnabled) {
						prevBox = GL.getParameter(GL.SCISSOR_BOX)
						const px = prevBox[0]
						const py = prevBox[1]
						const pw = prevBox[2]
						const ph = prevBox[3]
						const pr = px + pw
						const pb = py + ph
						const nr = nx + nw
						const nb = ny + nh
						nx = Math.max(px, nx)
						ny = Math.max(py, ny)
						nw = Math.max(0, Math.min(pr, nr) - nx)
						nh = Math.max(0, Math.min(pb, nb) - ny)
					}
					if (nw > 0 && nh > 0) {
						GL.enable(GL.SCISSOR_TEST)
						GL.scissor(nx, ny, nw, nh)
						this.drawChildren()
						if (wasEnabled && prevBox) {
							GL.scissor(
								prevBox[0],
								prevBox[1],
								prevBox[2],
								prevBox[3]
							)
						} else if (!wasEnabled) {
							GL.disable(GL.SCISSOR_TEST)
						}
					}
				}
				break
			}
		}
	}

	// 调整大小
	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing()
		}
		this.calculatePosition()
		const { children } = this
		const { length } = children
		const { proxy } = this
		proxy.x = this.x - this.scrollX
		proxy.y = this.y - this.scrollY
		proxy.width = this.width
		proxy.height = this.height
		proxy.matrix = this.matrix
		proxy.opacity = this.opacity
		for (let i = 0; i < length; i++) {
			const element = children[i]
			element.parent = proxy
			element.resize()
			element.parent = this
		}
		this._calculateScrollArea()
	}

	// 请求调整大小
	requestResizing = ((IIFE) => {
		const timer = new Timer({
			duration: 0,
			callback: () => this.resize()
		})
		return () => timer.add()
	})()

	// 计算滚动区域
	_calculateScrollArea() {
		const { max } = Math
		const { children } = this
		const { length } = children
		const parentWidth = this.width
		const parentHeight = this.height
		let scrollWidth = this.width
		let scrollHeight = this.height
		for (let i = 0; i < length; i++) {
			const { transform } = children[i]
			const sx = transform.scaleX
			const sy = transform.scaleY
			const x = transform.x + transform.x2 * parentWidth
			const y = transform.y + transform.y2 * parentHeight
			const w = max(transform.width + transform.width2 * parentWidth, 0)
			const h = max(
				transform.height + transform.height2 * parentHeight,
				0
			)
			scrollWidth = max(scrollWidth, x + (1 - transform.anchorX) * w * sx)
			scrollHeight = max(
				scrollHeight,
				y + (1 - transform.anchorY) * h * sy
			)
		}
		this.scrollWidth = scrollWidth
		this.scrollHeight = scrollHeight
		// this.scrollX = this.scrollX
		// this.scrollY = this.scrollY
	}

	// 销毁元素
	destroy() {
		super.destroy()
		this.destroyChildren()
	}

	// 水平网格 - 调整大小
	static horizontalGridResize() {
		this.calculatePosition()
		const { children } = this
		const { length } = children
		if (length === 0) {
			this.columns = 0
			this.rows = 0
			return
		}
		const { floor, ceil, max } = Math
		const { proxy } = this
		const {
			gridWidth,
			gridHeight,
			gridGapX,
			gridGapY,
			paddingX,
			paddingY
		} = this
		const unitWidth = gridWidth + gridGapX
		const unitHeight = gridHeight + gridGapY
		const columns =
			unitWidth === 0
				? length
				: max(
						floor(
							(this.width + gridGapX - paddingX * 2) / unitWidth
						),
						1
					)
		const rows = ceil(length / columns)
		const scrollHeight = rows * unitHeight - gridGapY + paddingY * 2
		this.scrollWidth = max(this.width, gridWidth)
		this.scrollHeight = max(this.height, scrollHeight)
		this.columns = columns
		this.rows = rows
		proxy.width = gridWidth
		proxy.height = gridHeight
		proxy.matrix = this.matrix
		proxy.opacity = this.opacity
		const sx = this.x - this.scrollX + paddingX
		const sy = this.y - this.scrollY + paddingY
		for (let i = 0; i < length; i++) {
			const element = children[i]
			proxy.x = sx + (i % columns) * unitWidth
			proxy.y = sy + floor(i / columns) * unitHeight
			element.parent = proxy
			element.resize()
			element.parent = this
		}
	}

	// 垂直网格 - 调整大小
	static verticalGridResize() {
		this.calculatePosition()
		const { children } = this
		const { length } = children
		if (length === 0) {
			this.columns = 0
			this.rows = 0
			return
		}
		const { floor, ceil, max } = Math
		const { proxy } = this
		const {
			gridWidth,
			gridHeight,
			gridGapX,
			gridGapY,
			paddingX,
			paddingY
		} = this
		const unitWidth = gridWidth + gridGapX
		const unitHeight = gridHeight + gridGapY
		const rows =
			unitHeight === 0
				? length
				: max(
						floor(
							(this.height + gridGapY - paddingY * 2) / unitHeight
						),
						1
					)
		const columns = ceil(length / rows)
		const scrollWidth = columns * unitWidth - gridGapX + paddingX * 2
		this.scrollWidth = max(this.width, scrollWidth)
		this.scrollHeight = max(this.height, gridHeight)
		this.columns = columns
		this.rows = rows
		proxy.width = gridWidth
		proxy.height = gridHeight
		proxy.matrix = this.matrix
		proxy.opacity = this.opacity
		const sx = this.x - this.scrollX + paddingX
		const sy = this.y - this.scrollY + paddingY
		for (let i = 0; i < length; i++) {
			const element = children[i]
			proxy.x = sx + floor(i / rows) * unitWidth
			proxy.y = sy + (i % rows) * unitHeight
			element.parent = proxy
			element.resize()
			element.parent = this
		}
	}
}
