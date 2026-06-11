'use strict'

// ******************************** 数据对象 ********************************

const Data = {
	// properties
	manifest: null,
	scenePresets: null,
	uiPresets: null,
	actors: null,
	skills: null,
	triggers: null,
	items: null,
	equipments: null,
	states: null,
	events: null,
	scripts: null,
	easings: null,
	teams: null,
	autotiles: null,
	variables: null,
	attribute: null,
	enumeration: null,
	localization: null,
	plugins: null,
	commands: null,
	config: null,
	scenes: null,
	ui: null,
	animations: null,
	particles: null,
	tilesets: null,
	// methods
	loadAll: null,
	loadMeta: null,
	loadFile: null,
	loadScene: null,
	close: null,
	createEasingItems: null,
	createTeamItems: null,
	createDataMaps: null,
	createGUIDMap: null,
	createTeamMap: null,
	createVariableMap: null,
	createAttributeContext: null,
	createEnumerationContext: null,
	createReferencedFileIDMap: null,
	generateVariableEnumScript: null,
	registerScenePresets: null,
	unregisterScenePresets: null,
	registerUiPresets: null,
	unregisterUiPresets: null,
	createManifest: null,
	saveManifest: null,
	filterManifest: null,
	inheritMetaData: null,
	parseGUID: null,
	loadScript: null
}

// 加载所有文件
Data.loadAll = function () {
	// 创建新的数据映射表
	this.createDataMaps()

	// 创建新的元数据清单
	this.createManifest()

	// 加载文件
	return Promise.all([
		this.loadMeta(),
		this.loadFile('easings'),
		this.loadFile('teams'),
		this.loadFile('autotiles'),
		this.loadFile('variables'),
		this.loadFile('attribute'),
		this.loadFile('enumeration'),
		this.loadFile('localization'),
		this.loadFile('plugins'),
		this.loadFile('commands'),
		this.loadFile('config')
	]).then(() => {
		Data.createGUIDMap(this.easings)
		Data.createGUIDMap(this.autotiles)
		Data.createTeamMap()
		Data.createVariableMap()
		Data.createAttributeContext()
		Data.createEnumerationContext()
		Data.createLocalizationMap()
	})
}

// 加载元数据
Data.loadMeta = function () {
	const path = 'Data/manifest.json'
	return File.get({
		path: path,
		type: 'json'
	}).then(
		(data) => {
			if (data === null) return
			Object.defineProperty(this.manifest, 'last', {
				configurable: true,
				value: data
			})
		},
		(error) => {
			error.message = path
			throw error
		}
	)
}

// 加载文件
Data.loadFile = function (filename) {
	const path = `Data/${filename}.json`
	return File.get({
		path: path,
		type: 'json'
	}).then((data) => {
		if (!data) {
			throw new SyntaxError(path)
		}
		const meta = {
			guid: filename,
			path: path,
			dataMap: this
		}
		this.manifest.project[filename] = meta
		this.manifest.guidMap[meta.guid] = meta
		return (this[filename] = data)
	})
}

// 加载场景
Data.loadScene = function (guid) {
	const { scenes } = this
	if (scenes[guid]) {
		return new Promise((resolve) => {
			resolve(Codec.decodeScene(scenes[guid]))
		})
	}

	const meta = this.manifest.guidMap[guid]
	if (!meta) {
		return new Promise((resolve, reject) => {
			reject(new URIError('Metadata is undefined.'))
		})
	}
	const path = meta.path
	return File.get({
		path: path,
		type: 'text'
	}).then((code) => {
		try {
			return Codec.decodeScene((scenes[guid] = code))
		} catch (error) {
			error.message = `${path}\n${error.message}`
			throw error
		}
	})
}

// 关闭数据
Data.close = function () {
	this.manifest = null
	this.scenePresets = null
	this.uiPresets = null
	this.actors = null
	this.skills = null
	this.triggers = null
	this.items = null
	this.equipments = null
	this.states = null
	this.events = null
	this.scripts = null
	this.easings = null
	this.teams = null
	this.autotiles = null
	this.variables = null
	this.attribute = null
	this.plugins = null
	this.commands = null
	this.config = null
	this.scenes = null
	this.ui = null
	this.animations = null
	this.particles = null
	this.tilesets = null
}

// 创建过渡选项
Data.createEasingItems = function () {
	let items = this.easings.items
	if (items === undefined) {
		// 把属性写入数组中不会被保存到文件
		items = this.easings.items = []
		const easings = this.easings
		const length = easings.length
		const digits = Number.computeIndexDigits(length)
		for (let i = 0; i < length; i++) {
			const index = i.toString().padStart(digits, '0')
			const easing = easings[i]
			items.push({
				name: `${index}:${easing.name}`,
				value: easing.id
			})
		}
	}
	return items
}

// 创建队伍选项
Data.createTeamItems = function () {
	let items = this.teams.list.items
	if (items === undefined) {
		items = this.teams.list.items = []
		const teams = this.teams.list
		const length = teams.length
		const digits = Number.computeIndexDigits(length)
		for (let i = 0; i < length; i++) {
			const index = i.toString().padStart(digits, '0')
			const team = teams[i]
			items.push({
				name: `${index}:${team.name}`,
				value: team.id
			})
		}
	}
	return items
}

// 创建数据映射表
Data.createDataMaps = function () {
	this.scenePresets = {}
	this.uiPresets = {}
	this.actors = {}
	this.skills = {}
	this.triggers = {}
	this.items = {}
	this.equipments = {}
	this.states = {}
	this.events = {}
	this.scripts = {}
	this.scenes = {}
	this.ui = {}
	this.animations = {}
	this.particles = {}
	this.tilesets = {}
}

// 创建GUID映射表
Data.createGUIDMap = function (list) {
	const map = {}
	for (const item of list) {
		map[item.id] = item
	}
	Object.defineProperty(list, 'map', {
		configurable: true,
		value: map
	})
}

// 创建队伍映射表
Data.createTeamMap = function () {
	const map = {}
	const teams = this.teams
	for (const item of teams.list) {
		map[item.id] = item
	}
	Object.defineProperty(teams, 'map', {
		configurable: true,
		value: map
	})
}

// 创建变量映射表
Data.createVariableMap = (function IIFE() {
	const set = (items, map) => {
		for (const item of items) {
			if (item.children) {
				set(item.children, map)
			} else {
				map[item.id] = item
			}
		}
	}
	return function () {
		const map = {}
		set(this.variables, map)
		Object.defineProperty(this.variables, 'map', {
			configurable: true,
			value: map
		})
	}
})()

// 创建属性上下文对象
Data.createAttributeContext = function () {
	Object.defineProperty(this.attribute, 'context', {
		configurable: true,
		value: new AttributeContext(this.attribute)
	})
}

// 创建枚举上下文对象
Data.createEnumerationContext = function () {
	Object.defineProperty(this.enumeration, 'context', {
		configurable: true,
		value: new EnumerationContext(this.enumeration)
	})
}

// 创建游戏本地化映射表
Data.createLocalizationMap = function () {
	const map = {}
	const set = (items) => {
		for (const item of items) {
			if (item.children) {
				set(item.children)
			} else {
				map[item.id] = item
			}
		}
	}
	set(this.localization.list)
	Object.defineProperty(this.localization, 'map', {
		configurable: true,
		value: map
	})
}

// 创建(可能)被引用的文件ID映射表
Data.createReferencedFileIDMap = function () {
	const usedMap = {}
	const list = [
		Object.values(this.ui),
		Object.values(this.scenes),
		Object.values(this.actors),
		Object.values(this.skills),
		Object.values(this.triggers),
		Object.values(this.items),
		Object.values(this.equipments),
		Object.values(this.states),
		Object.values(this.events),
		Object.values(this.scripts),
		Object.values(this.animations),
		Object.values(this.particles),
		Object.values(this.tilesets),
		this.plugins,
		this.commands,
		this.config
	]
	const { scenePresets, uiPresets } = Data
	const markToMap = (guid) => {
		usedMap[guid] = true
		if (guid in scenePresets) {
			usedMap[scenePresets[guid].sceneId] = true
		}
		if (guid in uiPresets) {
			usedMap[uiPresets[guid].uiId] = true
		}
	}
	let match
	const guid = /"([0-9a-f]{16})\\?"/g
	const code = JSON.stringify(list)
	while ((match = guid.exec(code))) {
		markToMap(match[1])
	}
	// 获取自动触发的事件
	for (const event of Object.values(this.events)) {
		if (event.type !== 'common') {
			markToMap(event.guid)
		}
	}
	// 获取脚本中可能引用的文件ID
	const guidInScript = /"[0-9a-f]{16}"|'[0-9a-f]{16}'/g
	for (const meta of Object.values(this.scripts)) {
		if (meta.guid in usedMap) {
			const code = meta.code
			while ((match = guidInScript.exec(code))) {
				markToMap(match[0].slice(1, -1))
			}
		}
	}
	return usedMap
}

// 生成变量枚举脚本
Data.generateVariableEnumScript = function () {
	const regexp = /^[\p{ID_Start}][\p{ID_Continue}]*$/u
	const spaces = / +/g
	const wraps = /\n+/g
	const validItems = []
	const invalidItems = []
	const duplicateItems = []
	const flags = {}
	const set = (items) => {
		for (const item of items) {
			if (item.children) {
				set(item.children)
				continue
			}
			// 移除空格字符
			let name = item.name
			if (name.indexOf(' ') !== -1) {
				name = name.replace(spaces, '')
			}
			if (name in flags) {
				duplicateItems.push(item)
				continue
			}
			if (regexp.test(name)) {
				flags[name] = true
				validItems.push({
					id: item.id,
					name: name,
					value: item.value,
					note: item.note
				})
				continue
			}
			invalidItems.push(item)
		}
	}
	set(this.variables)
	if (validItems.length + invalidItems.length + duplicateItems.length !== 0) {
		const contents = [
			'/** This script is generated and defines the IDs of global variables. */\n',
			'enum VAR {'
		]
		if (validItems.length !== 0) {
			for (const item of validItems) {
				const value = item.value
				const type = typeof value
				let init
				switch (type) {
					case 'boolean':
						init = ` = ${value.toString()}`
						break
					case 'number':
						init = ` = ${value.toString()}`
						break
					case 'string':
						init = ` = '${value.trim().replace(wraps, ' ')}'`
						if (init.length > 40) {
							init = `${init.slice(0, 40)}...'`
						}
						break
					case 'object':
						init = ''
						break
				}
				let note = item.note.trim()
				if (note !== '') {
					note =
						'\n   *  \n   *  ' + note.replace(wraps, '  \n   *  ')
				}
				contents.push(`  /** ${type}${init}${note} */`)
				contents.push(`  ${item.name} = '${item.id}',`)
			}
		}
		if (invalidItems.length !== 0) {
			contents.push(`  // Invalid variable names:`)
			for (const item of invalidItems) {
				contents.push(`  // ${item.name} = '${item.id}',`)
			}
		}
		if (duplicateItems.length !== 0) {
			contents.push(`  // Duplicate variable names:`)
			for (const item of duplicateItems) {
				contents.push(`  // ${item.name} = '${item.id}',`)
			}
		}
		contents.push('}')
		const code = contents.join('\n')
		const path = 'Script/yami.ts'
		const route = File.route(path)
		FSP.writeFile(route, code)
			.then(() => {
				console.log(`write: ${path}`)
			})
			.catch((error) => {
				console.warn(error)
			})
	}
}

// 注册场景预设元素
Data.registerScenePresets = function (sceneId) {
	const scene = this.scenes[sceneId]
	if (scene) {
		let changed = false
		const { scenePresets } = this
		const generatePresetId = () => {
			let id
			do {
				id = GUID.generate64bit()
			} while (id in scenePresets)
			return id
		}
		const setMap = (nodes) => {
			for (const node of nodes) {
				if (node.class === 'folder') {
					setMap(node.children)
				} else {
					// 如果存在该ID的元素，重新生成ID
					if (scenePresets[node.presetId]) {
						node.presetId = generatePresetId()
						changed = true
					}
					scenePresets[node.presetId] = {
						sceneId: sceneId,
						data: node
					}
				}
			}
		}
		setMap(scene.objects)
		// 如果发生了改变，立即写入UI文件，避免重新打开工程时影响已有预设元素的ID
		if (changed) {
			File.planToSave(Data.manifest.guidMap[sceneId])
			File.save(false)
		}
	}
}

// 取消注册场景预设元素
Data.unregisterScenePresets = function (sceneId) {
	const scene = this.scenes[sceneId]
	if (scene) {
		const { scenePresets } = this
		const unlink = (nodes) => {
			for (const node of nodes) {
				const { presetId } = node
				if (scenePresets[presetId]?.sceneId === sceneId) {
					delete scenePresets[presetId]
				}
				if (node.children) {
					unlink(node.children)
				}
			}
		}
		unlink(scene.objects)
	}
}

// 注册界面预设元素
Data.registerUiPresets = function (uiId) {
	const ui = this.ui[uiId]
	if (ui) {
		let changed = false
		const { uiPresets } = this
		const generatePresetId = () => {
			let id
			do {
				id = GUID.generate64bit()
			} while (id in uiPresets)
			return id
		}
		const setMap = (nodes) => {
			for (const node of nodes) {
				// 如果存在该ID的元素，重新生成ID
				if (uiPresets[node.presetId]) {
					node.presetId = generatePresetId()
					changed = true
				}
				uiPresets[node.presetId] = {
					uiId: uiId,
					data: node
				}
				if (node.children.length !== 0) {
					setMap(node.children)
				}
			}
		}
		setMap(ui.nodes)
		// 如果发生了改变，立即写入UI文件，避免重新打开工程时影响已有预设元素的ID
		if (changed) {
			File.planToSave(Data.manifest.guidMap[uiId])
			File.save(false)
		}
	}
}

// 取消注册界面预设元素
Data.unregisterUiPresets = function (uiId) {
	const ui = this.ui[uiId]
	if (ui) {
		const { uiPresets } = this
		const unlink = (nodes) => {
			for (const node of nodes) {
				const { presetId } = node
				if (uiPresets[presetId]?.uiId === uiId) {
					delete uiPresets[presetId]
				}
				if (node.children.length !== 0) {
					unlink(node.children)
				}
			}
		}
		unlink(ui.nodes)
	}
}

// 创建元数据清单
Data.createManifest = function () {
	this.manifest = new Manifest()
}

// 保存元数据清单
Data.saveManifest = function () {
	const manifest = this.manifest
	if (manifest?.changed) {
		manifest.changed = false
		const copy = Data.filterManifest(manifest)
		const json = JSON.stringify(copy, null, 2)
		const last = manifest.code
		if (json && json !== last) {
			const path = File.route('Data/manifest.json')
			return FSP.writeFile(path, json)
				.then(() => {
					manifest.code = json
				})
				.catch((error) => {
					Log.throw(error)
				})
		}
	}
	return null
}

// 过滤元数据
Data.filterManifest = function (manifest) {
	// 快速拷贝
	const copy = {}
	for (const key of Object.keys(manifest)) {
		copy[key] = manifest[key]
	}
	copy.images = Object.clone(manifest.images)
	copy.audio = Object.clone(manifest.audio)
	// 把未使用的图像和音频文件大小设置为0
	const { usedMap } = Reference.findAllGuids()
	for (const list of [copy.images, copy.audio]) {
		for (const meta of list) {
			const guid = Data.parseGUID(meta)
			if (usedMap[guid] === undefined) {
				meta.size = 0
			}
		}
	}
	return copy
}

// 继承元数据
Data.inheritMetaData = function () {
	const manifest = this.manifest
	const last = manifest.last
	const map = manifest.guidMap
	if (last === undefined) return
	for (const scene of last.scenes) {
		const guid = this.parseGUID(scene)
		const meta = map[guid]
		if (meta !== undefined) {
			meta.x = scene.x
			meta.y = scene.y
		}
	}
	for (const tileset of last.tilesets) {
		const guid = this.parseGUID(tileset)
		const meta = map[guid]
		if (meta !== undefined) {
			meta.x = tileset.x
			meta.y = tileset.y
		}
	}
	delete manifest.last
}

// 从元数据中解析GUID
Data.parseGUID = (function IIFE() {
	const regexp = /(?<=\.)[0-9a-f]{16}(?=\.\S+$)/
	return function (meta) {
		const match = meta.path.match(regexp)
		return match ? match[0] : ''
	}
})()

// 加载脚本
Data.loadScript = async function (file) {
	const meta = file.meta
	if (meta !== undefined) {
		const { scripts } = this
		const { guid } = meta
		await file.promise
		scripts[guid] = File.get({
			path: file.path,
			type: 'text'
		})
			.then((code) => {
				meta.code = code
				PluginManager.parseMeta(meta, code)
				return (scripts[guid] = meta)
			})
			.catch((error) => {
				delete scripts[guid]
			})
	}
}
