'use strict'
const require = window.__nodeRequire || window.require

// ******************************** 部署项目窗口 ********************************

export const Deployment = {
	// properties
	state: 'passed',
	gamedir: '',
	timer: null,
	compress: false,
	// methods
	initialize: null,
	open: null,
	check: null,
	readShellList: null,
	readFileList: null,
	readTsOutDir: null,
	copyFilesTo: null,
	compressJavaScript: null,
	// events
	platformInput: null,
	folderBeforeinput: null,
	folderInput: null,
	locationInput: null,
	chooseClick: null,
	confirm: null
}

// 初始化
Deployment.initialize = function () {
	// 创建平台选项
	$('#deployment-platform').loadItems([
		{ name: 'Windows x64', value: 'windows-x64' },
		{ name: 'MacOS Universal', value: 'mac-universal' },
		{ name: 'Web / Android / iOS', value: 'web' }
	])

	// 侦听事件
	$('#deployment-platform').on('input', this.platformInput)
	$('#deployment-folder').on('beforeinput', this.folderBeforeinput, {
		capture: true
	})
	$('#deployment-folder').on('input', this.folderInput)
	$('#deployment-location').on('input', this.locationInput)
	$('#deployment-choose').on('click', this.chooseClick)
	$('#deployment-confirm').on('click', this.confirm)
	$('#deployment-compress').on('change', (e) => {
		Deployment.compress = e.target.read()
	})
}

// 打开窗口
Deployment.open = function () {
	Window.open('deployment')
	const write = getElementWriter('deployment')
	const dialogs = Editor.config.dialogs
	const location = Path.normalize(dialogs.deploy)
	write('platform', 'windows-x64')
	write('folder', 'Output')
	write('location', location)
	$('#deployment-platform').getFocus()
	this.check()
}

// 检查路径
Deployment.check = function () {
	let folder = $('#deployment-folder').read()
	const location = $('#deployment-location').read()
	const platform = $('#deployment-platform').read()
	if (platform == 'mac-universal') {
		folder += '.app'
	}
	if (!folder) {
		if (this.state !== 'unnamed') {
			this.state = 'unnamed'
			$('#deployment-warning').textContent = Local.get(
				'confirmation.enterFolderName'
			)
			$('#deployment-confirm').disable()
		}
	} else if (FS.existsSync(Path.resolve(location, folder))) {
		if (this.state !== 'existing') {
			this.state = 'existing'
			$('#deployment-warning').textContent = Local.get(
				'confirmation.folderAlreadyExists'
			)
			$('#deployment-confirm').disable()
		}
	} else {
		if (this.state !== 'passed') {
			this.state = 'passed'
			$('#deployment-warning').textContent = ''
			$('#deployment-confirm').enable()
		}
	}
}

// 读取外壳文件列表
Deployment.readShellList = (function IIFE() {
	let root
	const options = { withFileTypes: true }
	const read = (path, list) => {
		return FSP.readdir(`${root}${path}`, options).then(async (files) => {
			if (path) {
				path += '/'
			}
			const promises = []
			for (const file of files) {
				const newPath = `${path}${file.name}`
				const srcPath = `${root}${newPath}`
				if (file.isDirectory()) {
					list.push({
						folder: true,
						shell: true,
						srcPath: srcPath,
						newPath: newPath
					})
					promises.push(read(newPath, list))
				} else {
					list.push({
						shell: true,
						srcPath: srcPath,
						newPath: newPath
					})
				}
			}
			if (promises.length !== 0) {
				await Promise.all(promises)
			}
			return list
		})
	}
	return function (rootDir) {
		root = Path.resolve(__dirname, rootDir) + '/'
		return read('', [])
	}
})()

// 读取文件列表
Deployment.readFileList = async function (platform) {
	// 暂时设置为强制加密
	const encrypt = true
	// 读取TSCONFIG的输出目录
	const tsOutDir = Deployment.readTsOutDir()
	if (!tsOutDir) {
		throw new Error('Unable to get "outDir" from "tsconfig.json".')
	}
	let fileList
	// 读取外壳文件列表
	switch (platform) {
		case 'windows-x64':
			fileList = await this.readShellList(
				Path.resolve(TemplatesPath, 'electron-win-x64')
			)
			this.gamedir = 'resources/app/'
			break
		case 'mac-universal':
			fileList = await this.readShellList(
				Path.resolve(TemplatesPath, 'electron-mac-universal.app')
			)
			this.gamedir = 'Contents/Resources/app/'
			break
		case 'web':
			fileList = []
			this.gamedir = ''
			break
	}
	// 添加文件夹列表
	fileList.push(
		{
			folder: true,
			path: 'Assets'
		},
		{
			folder: true,
			path: 'Module'
		},
		{
			folder: true,
			path: 'Icon'
		},
		{
			folder: true,
			path: 'Data'
		},
		{
			folder: true,
			path: `${tsOutDir}Script`
		}
	)
	const fileIdMap = await Data.createReferencedFileIDMap()
	// 打包初始化加载的数据
	const manifest = {
		ui: {},
		scenes: {},
		actors: {},
		skills: {},
		items: {},
		equipments: {},
		triggers: {},
		states: {},
		events: {},
		tilesets: {},
		animations: {},
		particles: {},
		images: [],
		audio: [],
		videos: [],
		fonts: [],
		script: [],
		others: []
	}
	for (const key of [
		'ui',
		'scenes',
		'actors',
		'triggers',
		'states',
		'events',
		'tilesets',
		'animations',
		'particles'
	]) {
		const sGroup = Data[key]
		const dGroup = manifest[key]
		for (const guid of Object.keys(sGroup)) {
			// 排除未用到的文件
			if (!fileIdMap[guid]) continue
			dGroup[guid] = sGroup[guid]
		}
	}
	// 获取技能|物品|装备的文件名(用来游戏中排序)
	const guidAndExt = /\.[0-9a-f]{16}\.\S+$/
	for (const key of ['skills', 'items', 'equipments']) {
		const dataGroup = Data[key]
		const manifestGroup = manifest[key]
		for (const { guid, path } of Data.manifest[key]) {
			// 排除未用到的文件
			if (!fileIdMap[guid]) continue
			const data = dataGroup[guid]
			if (data !== undefined) {
				manifestGroup[guid] = {
					...data,
					filename: Path.basename(path).replace(guidAndExt, '')
				}
			}
		}
	}
	// 复制配置文件，设置为已部署
	const config = Object.clone(Data.config)
	config.deployed = true
	// 添加数据文件列表
	fileList.push(
		{
			data: manifest,
			path: 'Data/manifest.json'
		},
		{
			data: config,
			path: 'Data/config.json'
		},
		{
			data: Data.easings,
			path: 'Data/easings.json'
		},
		{
			data: Data.teams,
			path: 'Data/teams.json'
		},
		{
			data: Data.autotiles,
			path: 'Data/autotiles.json'
		},
		{
			data: Data.variables,
			path: 'Data/variables.json'
		},
		{
			data: Data.attribute,
			path: 'Data/attribute.json'
		},
		{
			data: Data.enumeration,
			path: 'Data/enumeration.json'
		},
		{
			data: Data.localization,
			path: 'Data/localization.json'
		},
		{
			data: Data.plugins,
			path: 'Data/plugins.json'
		},
		{
			data: Data.commands,
			path: 'Data/commands.json'
		}
	)
	// 添加 Module 文件
	fileList.push(
		{
			path: 'Module/axios.min.js'
		},
		{
			path: 'Module/exceljs.min.js'
		}
	)
	// 添加基础文件列表
	fileList.push(
		{ path: 'index.html' },
		{ path: 'Icon/icon.png', encrypt: false },
		{ path: `${tsOutDir}Script/util.js` },
		{ path: `${tsOutDir}Script/loader.js` },
		{ path: `${tsOutDir}Script/codec.js` },
		{ path: `${tsOutDir}Script/webgl.js` },
		{ path: `${tsOutDir}Script/audio.js` },
		{ path: `${tsOutDir}Script/printer.js` },
		{ path: `${tsOutDir}Script/variable.js` },
		{ path: `${tsOutDir}Script/animation.js` },
		{ path: `${tsOutDir}Script/data.js` },
		{ path: `${tsOutDir}Script/local.js` },
		{ path: `${tsOutDir}Script/stage.js` },
		{ path: `${tsOutDir}Script/camera.js` },
		{ path: `${tsOutDir}Script/scene.js` },
		{ path: `${tsOutDir}Script/actor.js` },
		{ path: `${tsOutDir}Script/trigger.js` },
		{ path: `${tsOutDir}Script/filter.js` },
		{ path: `${tsOutDir}Script/input.js` },
		{ path: `${tsOutDir}Script/ui.js` },
		{ path: `${tsOutDir}Script/time.js` },
		{ path: `${tsOutDir}Script/event.js` },
		{ path: `${tsOutDir}Script/command.js` },
		{ path: `${tsOutDir}Script/flow.js` },
		{ path: `${tsOutDir}Script/yami.js` },
		{ path: `${tsOutDir}Script/main.js` }
	)
	// 重定向脚本文件列表
	const tsExtname = /\.ts$/
	for (let { guid, path, parameters } of Data.manifest.script) {
		// 排除未用到的文件
		if (!fileIdMap[guid]) continue
		// 重新映射TS脚本到输出目录的JS脚本
		if (tsExtname.test(path)) {
			path = tsOutDir + path.replace(tsExtname, '.js')
		}
		const newPath = `Assets/${guid}.js`
		manifest.script.push({
			path: newPath,
			parameters: parameters
		})
		fileList.push({
			srcPath: File.route(path),
			newPath: newPath
		})
	}
	// 重定向其他文件列表
	const fontNameRegexp = /([^/]+)\.\S+\.\S+$/
	for (const key of ['images', 'audio', 'videos', 'fonts', 'others']) {
		const sMetaList = Data.manifest[key]
		const dMetaList = manifest[key]
		for (const { guid, path, size } of sMetaList) {
			// 排除未用到的文件
			if (!fileIdMap[guid]) continue
			const extname =
				encrypt && key === 'images'
					? '.dat'
					: key === 'audio'
						? '.res'
						: Path.extname(path)
			const newPath = `Assets/${guid}${extname}`
			if (key === 'fonts') {
				dMetaList.push({
					path: newPath,
					name: path.match(fontNameRegexp)?.[1] ?? ''
				})
			} else {
				dMetaList.push({
					path: newPath,
					size: size
				})
			}
			fileList.push({
				srcPath: File.route(path),
				newPath: newPath
			})
		}
	}
	return fileList
}

// 读取TS输出目录
Deployment.readTsOutDir = function () {
	const ts = FS.readFileSync(File.route('tsconfig.json'), 'utf8')
	const match = ts.match(/"outDir"\s*:\s*"(.*?)"/)
	let outDir
	if (match) {
		outDir = Path.normalize(match[1])
	}
	if (!outDir.endsWith('/')) {
		outDir += '/'
	}
	return outDir
}

// 复制文件到指定目录
Deployment.copyFilesTo = function (dirPath) {
	Window.open('copyProgress')
	const platform = $('#deployment-platform').read()
	const progressBar = $('#copyProgress-bar')
	const progressInfo = $('#copyProgress-info')
	const { extnameToTypeMap } = FolderItem
	progressBar.style.width = '0'
	progressInfo.textContent = ''
	return this.readFileList(platform).then((list) => {
		let total = 0
		let count = 0
		let info = ''
		const dPath = `${dirPath}/`
		const promises = []
		const length = list.length
		for (let i = 0; i < length; i++) {
			const item = list[i]
			const srcPath = item.srcPath ?? File.route(item.path)
			const newPath = item.newPath ?? item.path
			const gamedir = item.shell ? '' : this.gamedir
			const dstPath = dPath + gamedir + newPath
			switch (item.folder) {
				case true:
					// 创建文件夹(同步)
					FS.mkdirSync(dstPath, { recursive: true })
					continue
				default:
					if (item.data) {
						// 写入数据到文件
						const json = JSON.stringify(item.data)
						promises.push(
							FSP.writeFile(dstPath, json).then(() => {
								count++
								info = newPath
							})
						)
					} else {
						switch (
							extnameToTypeMap[
								Path.extname(srcPath).toLowerCase()
							]
						) {
							case 'image':
								// 避免加密应用图标文件
								if (item.encrypt === false) {
									break
								}
								promises.push(
									(async () => {
										const buffer =
											await FSP.readFile(srcPath)
										await FSP.writeFile(
											dstPath,
											Codec.encodeFile(buffer)
										)
										count++
										info = newPath
									})()
								)
								continue
							case 'script':
								if (
									this.compress &&
									!srcPath.includes('.min.')
								) {
									promises.push(
										this.compressJavaScript(
											srcPath,
											dstPath
										).then(() => {
											count++
											info = newPath
										})
									)
								} else {
									promises.push(
										FSP.copyFile(srcPath, dstPath).then(
											() => {
												count++
												info = newPath
											}
										)
									)
								}
								continue
						}
						// 复制文件
						promises.push(
							FSP.copyFile(srcPath, dstPath).then(() => {
								count++
								info = newPath
							})
						)
					}
					total++
					continue
			}
		}
		this.timer = new Timer({
			duration: Infinity,
			update: () => {
				const percent = Math.round((count / total) * 100)
				progressBar.style.width = `${percent}%`
				progressInfo.textContent = info
			}
		}).add()
		return Promise.all(promises)
	})
}

// 压缩JavaScript文件
Deployment.compressJavaScript = function (srcPath, dstPath) {
	let uglifyJS
	try {
		uglifyJS = require('uglify-js')
	} catch (e) {
		uglifyJS = null
	}

	return new Promise((resolve, reject) => {
		if (!uglifyJS) {
			// If uglify-js is not available, just copy the file
			FSP.copyFile(srcPath, dstPath).then(resolve, reject)
			return
		}
		FSP.readFile(srcPath, 'utf8')
			.then((code) => {
				try {
					const result = uglifyJS.minify(code, {
						mangle: {
							toplevel: false, // 混淆顶层变量
							eval: true, // 混淆eval中的变量
							keep_fnames: false // 不保留函数名
						},
						compress: {
							sequences: true, // 合并多个语句
							properties: true, // 优化属性访问
							booleans: true, // 优化布尔表达式
							if_return: true, // 优化if/return
							join_vars: true // 合并变量声明
						},
						output: {
							beautify: false
						},
						sourceMap: false
					})
					if (result.error) {
						reject(result.error)
						throw result.error
					}
					return resolve(FSP.writeFile(dstPath, result.code))
				} catch {
					// If minification fails, fall back to copying the original file
					FSP.copyFile(srcPath, dstPath).then(resolve, reject)
				}
			})
			.catch(reject)
	})
}

// 平台 - 输入事件
Deployment.platformInput = function (event) {
	Deployment.check()
}

// 文件夹输入框 - 输入前事件
Deployment.folderBeforeinput = function (event) {
	if (event.inputType === 'insertText' && typeof event.data === 'string') {
		const regexp = /[\\/:*?"<>|"]/
		if (regexp.test(event.data)) {
			event.preventDefault()
			event.stopPropagation()
		}
	}
}

// 文件夹输入框 - 输入事件
Deployment.folderInput = function (event) {
	const regexp = /[\\/:*?"<>|"]/g
	const oldName = this.read()
	const newName = oldName.replace(regexp, '')
	if (oldName !== newName) {
		this.write(newName)
	}
	Deployment.check()
}

// 位置输入框 - 输入事件
Deployment.locationInput = function (event) {
	Deployment.check()
}

// 选择按钮 - 鼠标点击事件
Deployment.chooseClick = function (event) {
	const input = $('#deployment-location')
	File.showOpenDialog({
		defaultPath: input.read(),
		properties: ['openDirectory']
	}).then(({ filePaths }) => {
		if (filePaths.length === 1) {
			input.write(filePaths[0])
			Deployment.check()
		}
	})
}

// 确定按钮 - 鼠标点击事件
Deployment.confirm = function (event) {
	const platform = $('#deployment-platform').read()
	const location = $('#deployment-location').read()
	const folder = $('#deployment-folder').read()
	let path = Path.resolve(location, folder)
	Window.close('deployment')
	if (platform === 'mac-universal') {
		path += '.app'
	}
	return FSP.mkdir(path, { recursive: true })
		.then((done) => {
			return Deployment.copyFilesTo(path)
		})
		.finally(() => {
			Window.close('copyProgress')
			if (Deployment.timer) {
				Deployment.timer.remove()
				Deployment.timer = null
			}
		})
		.then(() => {
			Editor.config.dialogs.deploy = Path.slash(Path.resolve(location))
		})
		.catch((error) => {
			Log.throw(error)
			Window.confirm(
				{
					message: 'Failed to deploy project:\n' + error.message
				},
				[
					{
						label: 'Confirm'
					}
				]
			)
		})
}

window.Deployment = Deployment
