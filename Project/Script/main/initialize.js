'use strict'

// 初始化
Editor.initialize = async function () {
	// 关闭快捷键
	this.switchHotkey(false)

	// 加载配置数据
	try {
		// 提前初始化标题组件
		Title.initialize()
		const data = await window.config
		const code = JSON.stringify(data)
		this.config = data
		this.checkForEditorUpdates()
		Object.defineProperty(this.config, 'code', { value: code })
		delete window.config

		// 初始化组件对象
		// 单例通过 dependsOn 声明依赖关系，启动期按拓扑排序初始化
		const initializedSet = new Set()
		const singletonMap = {
			Local,
			AudioManager,
			Menubar,
			Home,
			Layout,
			Timer,
			Scene,
			UI,
			Animation,
			Particle,
			Window,
			EventEditor,
			Inspector,
			Command,
			Project,
			Easing,
			Team,
			PluginManager,
			CustomCommand,
			Log,
			UpdateLog,
			Reference,
			Directory,
			Browser,
			Selector,
			Printer,
			Color,
			Variable,
			Attribute,
			Enum,
			Localization,
			ImageClip,
			Selection,
			Zoom,
			Rename,
			SetKey,
			SetQuantity,
			SetTileTag,
			PresetObject,
			PresetElement,
			ArrayList,
			AttributeListInterface,
			ConditionListInterface
		}
		const initNames = Object.keys(singletonMap).filter(
			(n) => typeof singletonMap[n].initialize === 'function'
		)
		// 拓扑排序
		const graph = new Map(initNames.map((n) => [n, []]))
		const inDegree = new Map(initNames.map((n) => [n, 0]))
		for (const name of initNames) {
			const deps = singletonMap[name].dependsOn ?? []
			for (const dep of deps) {
				if (!graph.has(dep)) continue
				graph.get(dep).push(name)
				inDegree.set(name, inDegree.get(name) + 1)
			}
		}
		const queue = initNames.filter((n) => inDegree.get(n) === 0)
		while (queue.length) {
			const node = queue.shift()
			const singleton = singletonMap[node]
			singleton.initialize()
			initializedSet.add(node)
			for (const next of graph.get(node)) {
				inDegree.set(next, inDegree.get(next) - 1)
				if (inDegree.get(next) === 0) queue.push(next)
			}
		}
		// 循环依赖兜底
		for (const name of initNames) {
			if (!initializedSet.has(name)) {
				if (typeof Log !== 'undefined' && Log.warn) {
					Log.warn(
						`初始化循环依赖：${name} 未被初始化`,
						singletonMap[name].dependsOn
					)
				}
				singletonMap[name].initialize()
				initializedSet.add(name)
			}
		}

		// 加载配置文件
		this.loadConfig()
		Layout.manager.switch('home')
	} catch (error) {
		Log.throw(error)
		Window.confirm(
			{
				message: `Failed to initialize\n${error.message}`,
				close: () => {
					this.config = null
					this.quit()
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		)
	}
	EventBus.emit('editor_loaded')
}
