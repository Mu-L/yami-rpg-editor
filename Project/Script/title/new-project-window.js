const require = window.__nodeRequire || window.require
;('use strict')
import { $, getElementWriter } from '../util/dom.js'
import { Timer } from '../util/timer.js'
import { Data } from '../data/data-object.js'
import { GUID } from '../file/guid.js'
import { Project } from '../data/project-settings-window.js'
import { File } from '../file/file-system-core.js'
import { FS, FSP } from '../file/file-system.js'
import { Layout } from '../layout/layout.js'
import { Log } from '../log/log-window.js'
import { Editor } from '../main/editor.js'
import { TemplatesPath } from '../module/global.js'
import { Local } from '../tools/localization.js'
import { Window } from '../tools/window-object.js'
import { Path } from '../util/config.js'

// ******************************** 新建项目窗口 ********************************

export const NewProject = {
	// properties
	state: 'passed',
	timer: null,
	// methods
	initialize: null,
	open: null,
	check: null,
	readFileList: null,
	copyFilesTo: null,
	writeData: null,
	getNewFolder: null,
	// events
	templateInput: null,
	folderBeforeinput: null,
	folderInput: null,
	locationInput: null,
	chooseClick: null,
	confirm: null
}

// 初始化
NewProject.initialize = function () {
	// 创建模板选项
	$('#newProject-template').loadItems([
		{ name: 'ARPG - English', value: 'arpg-ts-english' },
		{ name: 'ARPG - 简体中文', value: 'arpg-ts-chinese' },
		{ name: 'Minimized Current Project', value: 'minimized-project' }
	])

	// 侦听事件
	$('#newProject-template').on('input', this.templateInput)
	$('#newProject-folder').on('beforeinput', this.folderBeforeinput, {
		capture: true
	})
	$('#newProject-folder').on('input', this.folderInput)
	$('#newProject-location').on('input', this.locationInput)
	$('#newProject-choose').on('click', this.chooseClick)
	$('#newProject-confirm').on('click', this.confirm)
}

// 打开窗口
NewProject.open = function () {
	Window.open('newProject')
	const write = getElementWriter('newProject')
	const dialogs = Editor.config.dialogs
	const location = Path.normalize(dialogs.new)
	const folder = this.getNewFolder(location)
	let template
	switch (Local.language) {
		default:
		case 'en-US':
			template = 'arpg-ts-english'
			break
		case 'zh-CN':
			template = 'arpg-ts-chinese'
			break
	}
	write('template', template)
	write('folder', folder)
	write('location', location)
	$('#newProject-template').getFocus()
	this.check()
}

// 检查路径
NewProject.check = function () {
	const folder = $('#newProject-folder').read()
	const location = $('#newProject-location').read()
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed'
			$('#newProject-warning').textContent = Local.get(
				'confirmation.enterFolderName'
			)
		}
		$('#newProject-confirm').disable()
	} else if (FS.existsSync(Path.resolve(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing'
			$('#newProject-warning').textContent = Local.get(
				'confirmation.folderAlreadyExists'
			)
		}
		$('#newProject-confirm').disable()
	} else {
		if (this.state !== 'passed') {
			this.state = 'passed'
			$('#newProject-warning').textContent = ''
		}
		// 如果选择最小化当前项目，并且没有打开项目，则禁用
		const template = $('#newProject-template').read()
		if (template === 'minimized-project' && Editor.state === 'closed') {
			$('#newProject-confirm').disable()
		} else {
			$('#newProject-confirm').enable()
		}
	}
}

// 读取文件列表
NewProject.readFileList = (function IIFE() {
	const options = { withFileTypes: true }
	const read = (dirname, idFilter, path, list) => {
		return FSP.readdir(`${dirname}/${path}`, options).then(
			async (files) => {
				if (path) {
					path += '/'
				}
				const promises = []
				for (const file of files) {
					const newPath = `${path}${file.name}`
					if (file.isDirectory()) {
						list.push({
							folder: true,
							path: newPath
						})
						promises.push(read(dirname, idFilter, newPath, list))
					} else {
						// 如果存在ID过滤器，文件名中包括了ID
						// 但是未在ID过滤器中找到，则判定为多余文件，跳过
						if (idFilter) {
							const guid = File.parseGUID(file.name)
							if (guid && !idFilter[guid]) continue
						}
						list.push({
							path: newPath
						})
					}
				}
				if (promises.length !== 0) {
					await Promise.all(promises)
				}
				return list
			}
		)
	}
	return function (dirname, idFilter) {
		return read(dirname, idFilter, '', [])
	}
})()

// 复制文件到指定目录
NewProject.copyFilesTo = function (sPath, dPath, idFilter) {
	Window.open('copyProgress')
	const progressBar = $('#copyProgress-bar')
	const progressInfo = $('#copyProgress-info')
	progressBar.style.width = '0'
	progressInfo.textContent = ''
	return this.readFileList(sPath, idFilter).then((list) => {
		let total = 0
		let count = 0
		let info = ''
		const promises = []
		const length = list.length
		for (let i = 0; i < length; i++) {
			const item = list[i]
			const path = item.path
			switch (item.folder) {
				case true:
					// 创建文件夹(同步)
					FS.mkdirSync(dPath + '/' + path)
					continue
				default:
					// 复制文件
					promises.push(
						FSP.copyFile(
							sPath + '/' + path,
							dPath + '/' + path
						).then(() => {
							count++
							info = path
						})
					)
					total++
					continue
			}
		}
		this.timer = new Timer({
			duration: Infinity,
			update: (timer) => {
				const percent = Math.round((count / total) * 100)
				progressBar.style.width = `${percent}%`
				progressInfo.textContent = info
			}
		}).add()
		return Promise.all(promises)
	})
}

// 写入数据
NewProject.writeData = function (dirPath) {
	const path = `${dirPath}/data/config.json`
	return FSP.readFile(path, 'utf8').then((data) => {
		const config = JSON.parse(data)
		config.gameId = GUID.generate64bit()
		config.save.subdir = config.gameId
		const json = JSON.stringify(config, null, 2)
		return FSP.writeFile(path, json)
	})
}

// 获取新的文件夹名称
NewProject.getNewFolder = function (location) {
	for (let i = 1; true; i++) {
		const folder = `Project${i}`
		if (!FS.existsSync(Path.resolve(location, folder))) {
			return folder
		}
	}
}

// 模板 - 输入事件
NewProject.templateInput = function (event) {
	NewProject.check()
}

// 文件夹输入框 - 输入前事件
NewProject.folderBeforeinput = function (event) {
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[\\/:*?"<>|"]/
		if (regexp.test(event.data)) {
			event.preventDefault()
			event.stopPropagation()
		}
	}
}

// 文件夹输入框 - 输入事件
NewProject.folderInput = function (event) {
	const regexp = /[\\/:*?"<>|"]/g
	const oldName = this.read()
	const newName = oldName.replace(regexp, '')
	if (oldName !== newName) {
		this.write(newName)
	}
	NewProject.check()
}

// 位置输入框 - 输入事件
NewProject.locationInput = function (event) {
	NewProject.check()
}

// 选择按钮 - 鼠标点击事件
NewProject.chooseClick = function (event) {
	const input = $('#newProject-location')
	File.showOpenDialog({
		defaultPath: input.read(),
		properties: ['openDirectory']
	}).then(({ filePaths }) => {
		if (filePaths.length === 1) {
			input.write(filePaths[0])
			NewProject.check()
		}
	})
}

// 确定按钮 - 鼠标点击事件
NewProject.confirm = function (event) {
	const template = $('#newProject-template').read()
	const location = $('#newProject-location').read()
	const folder = $('#newProject-folder').read()
	const sPath =
		template !== 'minimized-project'
			? Path.resolve(TemplatesPath, template)
			: Path.resolve(File.root)
	const dPath = Path.resolve(location, folder)
	Window.close('newProject')
	FSP.mkdir(dPath, { recursive: true })
		.then((done) => {
			return template === 'minimized-project'
				? Data.createReferencedFileIDMap()
				: undefined
		})
		.then((idFilter) => {
			return NewProject.copyFilesTo(sPath, dPath, idFilter)
		})
		.then((done) => {
			return NewProject.writeData(dPath)
		})
		.finally(() => {
			Window.close('copyProgress')
			if (NewProject.timer) {
				NewProject.timer.remove()
				NewProject.timer = null
			}
		})
		.then(() => {
			Editor.open(`${dPath}/game.yamirpg`)
			Editor.config.dialogs.new = Path.slash(Path.resolve(location))
		})
		.catch((error) => {
			Editor.close()
			Log.throw(error)
			Window.confirm(
				{
					message: 'Failed to create project',
					close: () => {
						Layout.manager.switch('home')
					}
				},
				[
					{
						label: 'Confirm'
					}
				]
			)
		})
}

const path = require('path')
