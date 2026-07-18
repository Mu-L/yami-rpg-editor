'use strict'
import { Data } from '../data/data-object.js'
import { Animation } from '../animation/animation-window.js'
import { UI } from './ui-window.js'
import { GL } from '../webgl/webgl-init.js'

// ******************************** 动画元素 ********************************

UI.Animation = class AnimationElement extends UI.Element {
	player //:object
	_animation //:string
	_motion //:string
	_rotatable //:boolean
	_angle //:number
	_frame //:number
	_offsetX //:number
	_offsetY //:number
	animationX //:number
	animationY //:number

	constructor(data) {
		super(data)
		this.player = null
		this.motion = data.motion
		this.rotatable = data.rotatable
		this.angle = data.angle
		this.frame = data.frame
		this.offsetX = data.offsetX
		this.offsetY = data.offsetY
		this.animation = data.animation
	}

	// 读取动画ID
	get animation() {
		return this._animation
	}

	// 写入动画ID
	set animation(value) {
		if (this._animation !== value) {
			this._animation = value
			if (this.player !== null) {
				this.player.destroy()
				this.player = null
			}
			const animation = Data.animations[value]
			if (animation !== undefined) {
				this.player = new Animation.Player(animation)
				this.player.setAsUIComponent()
				this.player.setMotion(this.motion)
				this.player.rotatable = this.rotatable
				this.player.setAngle(Math.radians(this.angle))
				this.player.goto(this.frame)
			}
		}
	}

	// 读取动作
	get motion() {
		return this._motion
	}

	// 写入动作
	set motion(value) {
		if (this._motion !== value) {
			this._motion = value
			this.player?.setMotion(value)
		}
	}

	// 读取可旋转开关
	get rotatable() {
		return this._rotatable
	}

	// 写入可旋转开关
	set rotatable(value) {
		if (this._rotatable !== value) {
			this._rotatable = value
			if (this.player) {
				this.player.rotatable = value
				this.player.rotation = 0
				if (typeof this.angle === 'number') {
					this.player.setAngle(Math.radians(this.angle))
				}
			}
		}
	}

	// 读取角度
	get angle() {
		return this._angle
	}

	// 写入角度
	set angle(value) {
		if (this._angle !== value) {
			this._angle = value
			this.player?.setAngle(Math.radians(value))
		}
	}

	// 读取帧索引
	get frame() {
		return this._frame
	}

	// 写入帧索引
	set frame(value) {
		if (this._frame !== value) {
			this._frame = value
			this.player?.goto(value)
		}
	}

	// 读取偏移X
	get offsetX() {
		return this._offsetX
	}

	// 写入偏移X
	set offsetX(value) {
		if (this._offsetX !== value) {
			this._offsetX = value
			if (this.connected) {
				this.calculateAnimationPosition()
			}
		}
	}

	// 读取偏移Y
	get offsetY() {
		return this._offsetY
	}

	// 写入偏移Y
	set offsetY(value) {
		if (this._offsetY !== value) {
			this._offsetY = value
			if (this.connected) {
				this.calculateAnimationPosition()
			}
		}
	}

	// 绘制图像
	draw() {
		if (this.visible === false) {
			return this.drawChildren()
		}
		const player = this.player
		if (player !== null) {
			GL.alpha = this.opacity
			const gl = GL
			const sl = UI.scrollLeft
			const st = UI.scrollTop
			const sr = UI.scrollRight
			const sb = UI.scrollBottom
			const program = gl.spriteProgram.use()
			const matrix = gl.matrix
				.project(gl.flip, sr - sl, sb - st)
				.translate(-sl, -st)
				.multiply(this.matrix)
			gl.uniform4f(program.u_Tint, 0, 0, 0, 0)
			gl.batchRenderer.bindProgram()
			gl.batchRenderer.setAttrSize(8)
			gl.bindVertexArray(program.vao)
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
			player.setPosition(this.animationX, this.animationY)
			player.updateFrameParameters(player.contexts, player.index)
			player.draw(1, 'raw')
			gl.batchRenderer.draw()
			gl.batchRenderer.unbindProgram()
		}

		// 绘制锚点
		this.drawAnchor()

		// 绘制子元素
		this.drawChildren()
	}

	// 绘制锚点
	drawAnchor() {
		if (UI.target === this.node) {
			const gl = GL
			const vertices = gl.arrays[0].float32
			const matrix = gl.matrix.set(UI.matrix).multiply(this.matrix)
			const ax = this.animationX
			const ay = this.animationY
			const a = matrix[0]
			const b = matrix[1]
			const c = matrix[3]
			const d = matrix[4]
			const e = matrix[6]
			const f = matrix[7]
			const x = a * ax + c * ay + e
			const y = b * ax + d * ay + f
			vertices[0] = x + 0.5 - 8
			vertices[1] = y + 0.5
			vertices[2] = x + 0.5 + 9
			vertices[3] = y + 0.5
			vertices[4] = x + 0.5
			vertices[5] = y + 0.5 - 8
			vertices[6] = x + 0.5
			vertices[7] = y + 0.5 + 9
			matrix.project(gl.flip, gl.width, gl.height)
			gl.alpha = 1
			gl.blend = 'normal'
			const program = gl.graphicProgram.use()
			gl.bindVertexArray(program.vao.a10)
			gl.uniformMatrix3fv(program.u_Matrix, false, matrix)
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8)
			gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 1)
			gl.drawArrays(gl.LINES, 0, 4)
		}
	}

	// 调整大小
	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing()
		}
		this.calculatePosition()
		this.calculateAnimationPosition()
		this.resizeChildren()
	}

	// 计算动画位置
	calculateAnimationPosition() {
		this.animationX = this.x + this.width / 2 + this.offsetX
		this.animationY = this.y + this.height / 2 + this.offsetY
	}

	// 销毁元素
	destroy() {
		super.destroy()
		this.player?.destroy()
		this.destroyChildren()
	}
}
