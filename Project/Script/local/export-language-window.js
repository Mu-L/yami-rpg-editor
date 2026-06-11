'use strict'

// ******************************** 导出语言包窗口 ********************************

const ExportLanguage = {
	// methods
	initialize: null,
	open: null,
	exportLanguagePack: null,
	stringifyLanguagePack: null,
	// events
	confirm: null
}

// 初始化
ExportLanguage.initialize = function () {
	// 侦听事件
	$('#exportLanguage-confirm').on('click', this.confirm)
}

// 打开窗口
ExportLanguage.open = function () {
	Window.open('exportLanguage')

	// 创建语言选项
	const items = []
	const none = { name: Local.get('common.none'), value: '' }
	for (const language of Data.config.localization.languages) {
		items.push({
			name: Local.get('languages.' + language.name),
			value: language.name
		})
	}
	$('#exportLanguage-first').loadItems(items)
	$('#exportLanguage-first').writeDefault()
	$('#exportLanguage-second').loadItems([none, ...items])
	$('#exportLanguage-second').writeDefault()
}

// 导出语言包
ExportLanguage.exportLanguagePack = function (first, second) {
	const pack = {}
	// 加载文本到映射表
	const loadText = (items) => {
		for (const item of items) {
			if (item.class === 'folder') {
				loadText(item.children)
			} else {
				const { id, contents } = item
				pack[id] = contents[first] || contents[second] || ''
			}
		}
	}
	loadText(Data.localization.list)
	return this.stringifyLanguagePack(pack)
}

// 字符串化语言包
ExportLanguage.stringifyLanguagePack = function (map) {
	const entries = Object.entries(map)
	const length = entries.length
	const strings = new Array(length)
	for (let i = 0; i < length; i++) {
		const [id, text] = entries[i]
		strings[i] = '$' + id + '\n' + text
	}
	return strings.join('\n\n')
}

// 确定按钮 - 鼠标点击事件
ExportLanguage.confirm = function (event) {
	Window.close('exportLanguage')
	const dialogs = Editor.config.dialogs
	const first = $('#exportLanguage-first').read()
	const second = $('#exportLanguage-second').read()
	File.showSaveDialog({
		defaultPath: Path.resolve(dialogs.export, first + '.txt')
	}).then(({ filePath }) => {
		if (filePath) {
			dialogs.export = Path.slash(Path.dirname(filePath))
			const string = ExportLanguage.exportLanguagePack(first, second)
			return FSP.writeFile(filePath, string)
		}
	})
}
