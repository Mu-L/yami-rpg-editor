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
		Local.initialize()
		AudioManager.initialize()
		Menubar.initialize()
		Home.initialize()
		Layout.initialize()
		Timer.initialize()
		Scene.initialize()
		UI.initialize()
		Animation.initialize()
		Particle.initialize()
		Window.initialize()
		EventEditor.initialize()
		Inspector.initialize()
		Command.initialize()
		Project.initialize()
		Easing.initialize()
		Team.initialize()
		PluginManager.initialize()
		CustomCommand.initialize()
		Log.initialize()
		UpdateLog.initialize()
		Reference.initialize()
		Directory.initialize()
		Browser.initialize()
		Selector.initialize()
		Printer.initialize()
		Color.initialize()
		Variable.initialize()
		Attribute.initialize()
		Enum.initialize()
		Localization.initialize()
		ImageClip.initialize()
		Selection.initialize()
		Zoom.initialize()
		Rename.initialize()
		SetKey.initialize()
		SetQuantity.initialize()
		SetTileTag.initialize()
		PresetObject.initialize()
		PresetElement.initialize()
		ArrayList.initialize()
		AttributeListInterface.initialize()
		ConditionListInterface.initialize()

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
