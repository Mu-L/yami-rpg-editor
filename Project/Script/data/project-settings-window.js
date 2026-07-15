'use strict'
const require = window.__nodeRequire || window.require

// ******************************** 项目设置窗口 ********************************

export const Project = {
	// properties
	data: null,
	changed: false,
	importedFonts: null,
	languages: null,
	tscStarted: false,
	// methods
	initialize: null,
	open: null,
	startTSC: null,
	stopTSC: null,
	// events
	windowClose: null,
	windowClosed: null,
	projectChange: null,
	dataChange: null,
	paramInput: null,
	confirm: null
}

// 初始化
Project.initialize = function () {
	// 创建窗口显示模式选项
	$('#config-window-display').loadItems([
		{ name: 'Windowed', value: 'windowed' },
		{ name: 'Maximized', value: 'maximized' },
		{ name: 'Fullscreen', value: 'fullscreen' }
	])

	// 创建角色碰撞选项
	$('#config-collision-actor-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	])

	// 创建场景碰撞选项
	$('#config-collision-scene-enabled').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	])

	// 设置场景碰撞关联元素
	$('#config-collision-scene-enabled')
		.enableHiddenMode()
		.relate([
			{ case: true, targets: [$('#config-collision-scene-actorSize')] }
		])

	// 创建触发器碰撞模式选项
	$('#config-collision-trigger-collideWithActorShape').loadItems([
		{ name: "Collide With Actor's Shape", value: true },
		{ name: "Collide With Actor's Anchor", value: false }
	])

	// 绑定导入字体列表
	$('#config-text-importedFonts').bind(this.importedFonts)

	// 创建高清晰度选项
	$('#config-text-highDefinition').loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	])

	// 绑定角色临时属性列表
	$('#config-actor-tempAttributes').bind(new AttributeListInterface())

	// 创建WebGL低延时模式选项
	$('#config-webgl-desynchronized').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	])

	// 创建WebGL纹理放大滤波器选项
	$('#config-webgl-textureMagFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	])

	// 创建WebGL纹理缩小滤波器选项
	$('#config-webgl-textureMinFilter').loadItems([
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Linear', value: 'linear' }
	])

	// 创建脚本自动编译选项
	$('#config-script-autoCompile').loadItems([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	])

	// 创建存档位置选项
	$('#config-save-location').loadItems([
		{ name: 'App Data', value: 'app-data' },
		{ name: 'Documents', value: 'documents' },
		{ name: 'Local Directory', value: 'local' }
	])

	// 设置场景碰撞关联元素
	$('#config-save-location')
		.enableHiddenMode()
		.relate([
			{
				case: ['app-data', 'documents'],
				targets: [$('#config-save-subdir')]
			}
		])

	// 绑定语言列表
	$('#config-localization-languages').bind(this.languages)

	// 创建预加载选项
	$('#config-preload').loadItems([
		{ name: 'Never', value: 'never' },
		{ name: 'Always', value: 'always' },
		{ name: 'Only on Deployment', value: 'deployed' }
	])

	// 侦听事件
	window.on('datachange', this.projectChange)
	$('#project-settings').on('close', this.windowClose)
	$('#project-settings').on('closed', this.windowClosed)
	$('#project-settings').on('change', this.dataChange)
	$('#project-confirm').on('click', this.confirm)
	$(`#config-window-title, #config-window-width, #config-window-height,
    #config-window-display, #config-resolution-width, #config-resolution-height,
    #config-resolution-sceneScale, #config-resolution-uiScale,
    #config-scene-padding, #config-scene-animationInterval,
    #config-tileArea-expansionTop, #config-tileArea-expansionLeft,
    #config-tileArea-expansionRight, #config-tileArea-expansionBottom,
    #config-animationArea-expansionTop, #config-animationArea-expansionLeft,
    #config-animationArea-expansionRight, #config-animationArea-expansionBottom,
    #config-lightArea-expansionTop, #config-lightArea-expansionLeft,
    #config-lightArea-expansionRight, #config-lightArea-expansionBottom,
    #config-virtualAxis-up, #config-virtualAxis-down, #config-virtualAxis-left, #config-virtualAxis-right,
    #config-collision-actor-enabled, #config-collision-scene-enabled, #config-collision-scene-actorSize,
    #config-collision-trigger-collideWithActorShape, #config-text-fontFamily,
    #config-text-highDefinition, #config-animation-frameRate,
    #config-soundAttenuation-distance, #config-soundAttenuation-easingId,
    #config-webgl-desynchronized, #config-webgl-textureMagFilter, #config-webgl-textureMinFilter,
    #config-script-autoCompile, #config-save-location, #config-save-subdir,
    #config-localization-languages, #config-localization-default, #config-preload, #config-deadzone`).on(
		'input',
		this.paramInput
	)
}

// 打开窗口
Project.open = function () {
	Window.open('project-settings')

	// 创建数据副本
	this.data = Object.clone(Data.config)

	// 创建音效衰减过渡选项
	$('#config-soundAttenuation-easingId').loadItems(Data.createEasingItems())

	// 写入数据
	const write = getElementWriter('config', this.data)
	write('window-title')
	write('window-width')
	write('window-height')
	write('window-display')
	write('resolution-width')
	write('resolution-height')
	write('resolution-sceneScale')
	write('resolution-uiScale')
	write('scene-padding')
	write('scene-animationInterval')
	write('tileArea-expansionTop')
	write('tileArea-expansionLeft')
	write('tileArea-expansionRight')
	write('tileArea-expansionBottom')
	write('animationArea-expansionTop')
	write('animationArea-expansionLeft')
	write('animationArea-expansionRight')
	write('animationArea-expansionBottom')
	write('lightArea-expansionTop')
	write('lightArea-expansionLeft')
	write('lightArea-expansionRight')
	write('lightArea-expansionBottom')
	write('virtualAxis-up')
	write('virtualAxis-down')
	write('virtualAxis-left')
	write('virtualAxis-right')
	write('collision-actor-enabled')
	write('collision-scene-enabled')
	write('collision-scene-actorSize')
	write('collision-trigger-collideWithActorShape')
	write('text-importedFonts')
	write('text-fontFamily')
	write('text-highDefinition')
	write('actor-tempAttributes')
	write('animation-frameRate')
	write('soundAttenuation-distance')
	write('soundAttenuation-easingId')
	write('webgl-desynchronized')
	write('webgl-textureMagFilter')
	write('webgl-textureMinFilter')
	write('script-autoCompile')
	write('save-location')
	write('save-subdir')
	write('localization-languages')
	write('localization-default')
	write('preload')
	write('deadzone')
}

// 启动TypeScript编译
Project.startTSC = function () {
	if (!this.tscStarted) {
		this.tscStarted = true
		require('electron').ipcRenderer.send('start-tsc', File.root)
	}
}

// 停止TypeScript编译
Project.stopTSC = function () {
	if (this.tscStarted) {
		this.tscStarted = false
		require('electron').ipcRenderer.send('stop-tsc')
		Log.clear()
	}
}

// 窗口 - 关闭事件
Project.windowClose = function (event) {
	if (Project.changed) {
		event.preventDefault()
		const get = Local.createGetter('confirmation')
		Window.confirm(
			{
				message: get('closeUnsavedProjectSettings')
			},
			[
				{
					label: get('yes'),
					click: () => {
						Project.changed = false
						Window.close('project-settings')
					}
				},
				{
					label: get('no')
				}
			]
		)
	}
}

// 窗口 - 已关闭事件
Project.windowClosed = function (event) {
	Project.data = null
}

// 项目 - 改变事件
Project.projectChange = function (event) {
	if (event.key === 'config') {
		const last = event.last.script
		const current = Data.config.script
		if (current.autoCompile !== last.autoCompile) {
			if (current.autoCompile) {
				Project.startTSC()
			} else {
				Project.stopTSC()
			}
		}
	}
}

// 数据 - 改变事件
Project.dataChange = function (event) {
	this.changed = true
}.bind(Project)

// 参数 - 输入事件
Project.paramInput = function (event) {
	const key = Inspector.getKey(this)
	const value = this.read()
	const keys = key.split('-')
	const end = keys.length - 1
	let node = Project.data
	for (let i = 0; i < end; i++) {
		node = node[keys[i]]
	}
	const property = keys[end]
	if (node[property] !== value) {
		node[property] = value
	}
}

// 过滤重复的语言
Project.filterDuplicateLanguages = function () {
	const local = this.data.localization
	const languages = []
	for (const language of local.languages) {
		languages.append(language)
	}
	local.languages = languages
}

// 确定按钮 - 鼠标点击事件
Project.confirm = function (event) {
	if (this.changed) {
		this.changed = false
		this.filterDuplicateLanguages()
		const last = Data.config
		const title1 = Data.config.window.title
		const title2 = this.data.window.title
		Data.config = this.data
		File.planToSave(Data.manifest.project.config)
		// 更新标题名称
		if (title1 !== title2) {
			Title.updateTitleName()
		}
		const datachange = new Event('datachange')
		datachange.key = 'config'
		datachange.last = last
		window.dispatchEvent(datachange)
	}
	Window.close('project-settings')
}.bind(Project)

// 导入字体列表接口
Project.importedFonts = {
	fontId: null,
	filter: 'font',
	initialize: function () {},
	parse: function (fontId) {
		return Command.removeTextTags(Command.parseFileName(fontId))
	},
	open: function (fontId = '') {
		this.fontId = fontId
		Selector.open(this, false)
	},
	save: function () {
		return this.fontId
	},
	read: function () {
		return this.fontId
	},
	input: function (fontId) {
		this.fontId = fontId
		this.target.save()
	}
}

// 语言列表接口
Project.languages = {
	initialize: function (list) {
		$('#language-confirm').on('click', () => {
			// 如果是插入模式且语言重复，阻止操作
			if (list.inserting) {
				const languages = Project.data.localization.languages
				const langName = $('#language-name').read()
				if (languages.find((lang) => lang.name === langName)) {
					return $('#language-name').getFocus()
				}
			}
			this.target.save()
			Window.close('language')
		})
	},
	parse: function (language) {
		return [
			{ content: Local.get('languages.' + language.name) },
			{ content: language.name, class: 'weak' }
		]
	},
	open: function (language = { name: '', font: '', scale: 1 }) {
		$('#language-name').loadItems(this.createAllItems())
		$('#language-name').write2(language.name)
		$('#language-font').write(language.font)
		$('#language-scale').write(language.scale)
		$('#language-name').getFocus()
		Window.open('language')
	},
	save: function () {
		return {
			name: $('#language-name').read(),
			font: $('#language-font').read(),
			scale: $('#language-scale').read()
		}
	},
	update: function () {
		// 创建默认游戏语言选项
		const selectBox = $('#config-localization-default')
		const defaultLang = selectBox.read()
		selectBox.loadItems(Project.languages.createValidItems())
		if (defaultLang) selectBox.write(defaultLang)
	},
	createAllItems: function () {
		const items = []
		const languages = Local.get('languages')
		if (languages) {
			for (const [value, name] of Object.entries(languages)) {
				if (value !== 'auto') {
					items.push({ name, value })
				}
			}
		}
		return items
	},
	createValidItems: function () {
		const items = []
		const languages = Local.get('languages')
		if (languages) {
			const langList = Project.data.localization.languages.map(
				(lang) => lang.name
			)
			for (const [value, name] of Object.entries(languages)) {
				if (value === 'auto' || langList.includes(value)) {
					items.push({ name, value })
				}
			}
		}
		return items
	}
}

window.Project = Project
