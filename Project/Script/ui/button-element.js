'use strict'

// ******************************** 按钮元素 ********************************

UI.Button = class ButtonElement extends UI.Element {
	state //:string
	shadowImage //:element
	shadowText //:element
	_imagePadding //:number
	_textPadding //:number
	normalImage //:string
	normalClip //:array
	hoverImage //:string
	hoverClip //:array
	activeImage //:string
	activeClip //:array
	normalColor //:string
	hoverColor //:string
	activeColor //:string
	_imageOpacity //:number
	imageEffect //:string
	normalTint //:array
	hoverTint //:array
	activeTint //:array

	constructor(data) {
		super(data)
		this.state = 'normal'
		this.shadowImage = this.createShadowImage(data)
		this.shadowText = this.createShadowText(data)
		this.imageOpacity = data.imageOpacity
		this.imagePadding = data.imagePadding
		this.textPadding = data.textPadding
		this.normalImage = data.normalImage
		this.normalClip = data.normalClip
		this.hoverImage = data.hoverImage
		this.hoverClip = data.hoverClip
		this.activeImage = data.activeImage
		this.activeClip = data.activeClip
		this.normalColor = data.normalColor
		this.hoverColor = data.hoverColor
		this.activeColor = data.activeColor
		this.imageEffect = data.imageEffect
		this.normalTint = data.normalTint
		this.hoverTint = data.hoverTint
		this.activeTint = data.activeTint
	}

	// 读取图像内边距
	get imagePadding() {
		return this._imagePadding
	}

	// 写入图像内边距
	set imagePadding(value) {
		if (this._imagePadding !== value) {
			this._imagePadding = value
			this.shadowImage.transform.width = -value * 2
			this.shadowImage.transform.height = -value * 2
			if (this.connected) {
				this.shadowImage.resize()
			}
		}
	}

	// 读取文本内边距
	get textPadding() {
		return this._textPadding
	}

	// 写入文本内边距
	set textPadding(value) {
		if (this._textPadding !== value) {
			this._textPadding = value
			this.shadowText.transform.width = -value * 2
			this.shadowText.transform.height = -value * 2
			if (this.connected) {
				this.shadowText.resize()
			}
		}
	}

	// 读取图像
	get image() {
		return this.shadowImage.image
	}

	// 写入图像
	set image(value) {
		this.shadowImage.image = value
	}

	// 读取显示模式
	get display() {
		return this.shadowImage.display
	}

	// 写入显示模式
	set display(value) {
		this.shadowImage.display = value
	}

	// 读取翻转模式
	get flip() {
		return this.shadowImage.flip
	}

	// 写入翻转模式
	set flip(value) {
		this.shadowImage.flip = value
	}

	// 读取裁剪区域
	get clip() {
		return this.shadowImage.clip
	}

	// 写入裁剪区域
	set clip(value) {
		this.shadowImage.clip = value
	}

	// 读取图像切片边距
	get border() {
		return this.shadowImage.border
	}

	// 写入图像切片边距
	set border(value) {
		this.shadowImage.border = value
	}

	// 读取图像不透明度
	get imageOpacity() {
		return this.shadowImage.transform.opacity
	}

	// 写入图像不透明度
	set imageOpacity(value) {
		this.shadowImage.transform.opacity = value
		if (this.connected) {
			this.shadowImage.resize()
		}
	}

	// 读取文本内容
	get content() {
		return this.shadowText.content
	}

	// 写入文本内容
	set content(value) {
		this.shadowText.content = value
	}

	// 读取字体大小
	get size() {
		return this.shadowText.size
	}

	// 写入字体大小
	set size(value) {
		this.shadowText.size = value
	}

	// 读取字体
	get font() {
		return this.shadowText.font
	}

	// 写入字体
	set font(value) {
		this.shadowText.font = value
	}

	// 读取方向
	get direction() {
		return this.shadowText.direction
	}

	// 写入方向
	set direction(value) {
		this.shadowText.direction = value
	}

	// 读取水平对齐
	get horizontalAlign() {
		return this.shadowText.horizontalAlign
	}

	// 写入水平对齐
	set horizontalAlign(value) {
		this.shadowText.horizontalAlign = value
	}

	// 读取垂直对齐
	get verticalAlign() {
		return this.shadowText.verticalAlign
	}

	// 写入垂直对齐
	set verticalAlign(value) {
		this.shadowText.verticalAlign = value
	}

	// 读取字体大小
	get size() {
		return this.shadowText.size
	}

	// 写入字体大小
	set size(value) {
		this.shadowText.size = value
	}

	// 读取行间距
	get lineSpacing() {
		return this.shadowText.lineSpacing
	}

	// 写入行间距
	set lineSpacing(value) {
		this.shadowText.lineSpacing = value
	}

	// 读取字间距
	get letterSpacing() {
		return this.shadowText.letterSpacing
	}

	// 写入字间距
	set letterSpacing(value) {
		this.shadowText.letterSpacing = value
	}

	// 读取颜色
	get color() {
		return this.shadowText.color
	}

	// 写入颜色
	set color(value) {
		this.shadowText.color = value
	}

	// 读取字体
	get font() {
		return this.shadowText.font
	}

	// 写入字体
	set font(value) {
		this.shadowText.font = value
	}

	// 读取字型
	get typeface() {
		return this.shadowText.typeface
	}

	// 写入字型
	set typeface(value) {
		this.shadowText.typeface = value
	}

	// 读取文字效果
	get textEffect() {
		return this.shadowText.effect
	}

	// 写入文字效果
	set textEffect(value) {
		this.shadowText.effect = value
	}

	// 创建影子图像元素
	createShadowImage(data) {
		const image = data.normalImage
		const clip = data.normalClip
		const tint = [0, 0, 0, 0]
		const transform = this.createShadowTransform()
		const element = new UI.Image({ ...data, image, clip, tint, transform })
		element.parent = this
		element.connected = true
		return element
	}

	// 创建影子文本元素
	createShadowText(data) {
		const color = data.normalColor
		const effect = data.textEffect
		const transform = this.createShadowTransform()
		const element = new UI.Text({ ...data, color, effect, transform })
		element.parent = this
		element.connected = true
		return element
	}

	// 创建影子变换对象
	createShadowTransform() {
		const transform = Inspector.uiElement.createTransform()
		transform.anchorX = 0.5
		transform.anchorY = 0.5
		transform.x2 = 0.5
		transform.y2 = 0.5
		transform.width2 = 1
		transform.height2 = 1
		return transform
	}

	// 更新文本内容
	updateTextContent() {
		this.shadowText.updateTextContent()
	}

	// 更新打印机
	updatePrinter() {
		this.shadowText.updatePrinter()
	}

	// 更新图像
	updateImage() {
		let state
		if (UI.dragging?.node === this.node) {
			state = 'active'
		} else if (UI.hover === this.node) {
			state = 'hover'
		} else {
			state = 'normal'
		}
		if (this.state !== state) {
			this.state = state
			switch (state) {
				case 'normal':
					// 正常状态
					this.image = this.normalImage
					this.color = this.normalColor
					this.clip = this.normalClip
					switch (this.imageEffect) {
						case 'none':
							this.shadowImage.tint.fill(0)
							break
						case 'tint-1':
						case 'tint-2':
						case 'tint-3':
							this.shadowImage.tint.set(this.normalTint)
							break
					}
					break
				case 'hover':
					// 鼠标悬停状态
					this.image = this.hoverImage || this.normalImage
					this.color = this.hoverColor || this.normalColor
					this.clip =
						(this.hoverImage && this.hoverClip) || this.normalClip
					switch (this.imageEffect) {
						case 'none':
							break
						case 'tint-1':
							this.shadowImage.tint.set(this.normalTint)
							break
						case 'tint-2':
						case 'tint-3':
							this.shadowImage.tint.set(this.hoverTint)
							break
					}
					break
				case 'active':
					// 鼠标按下状态
					this.image =
						this.activeImage || this.hoverImage || this.normalImage
					this.color =
						this.activeColor || this.hoverColor || this.normalColor
					this.clip =
						(this.activeImage && this.activeClip) ||
						(this.hoverImage && this.hoverClip) ||
						this.normalClip
					switch (this.imageEffect) {
						case 'none':
							break
						case 'tint-1':
							this.shadowImage.tint.set(this.normalTint)
							break
						case 'tint-2':
							this.shadowImage.tint.set(this.hoverTint)
							break
						case 'tint-3':
							this.shadowImage.tint.set(this.activeTint)
							break
					}
					break
			}
		}
	}

	// 绘制图像
	draw() {
		if (this.visible === false) {
			return this.drawChildren()
		}

		// 更新图像
		this.updateImage()

		// 绘制图像(不存在图片时跳过)
		if (this.image) {
			this.shadowImage.visible = this.visible
			this.shadowImage.draw()
		}

		// 绘制文本
		this.shadowText.visible = this.visible
		this.shadowText.draw()

		// 绘制子元素
		this.drawChildren()
	}

	// 调整大小
	resize() {
		if (this.parent instanceof UI.Window) {
			return this.parent.requestResizing()
		}
		this.calculatePosition()
		this.shadowImage.resize()
		this.shadowText.resize()
		this.resizeChildren()
	}

	// 销毁元素
	destroy() {
		super.destroy()
		this.shadowImage.destroy()
		this.shadowText.destroy()
		this.destroyChildren()
	}
}
