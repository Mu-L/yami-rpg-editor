'use strict'

// 保存项目文件
Editor.saveProject = function () {
	const { project } = this
	if (!project) {
		return
	}
	try {
		Scene.saveToProject(project)
		UI.saveToProject(project)
		Animation.saveToProject(project)
		Particle.saveToProject(project)
		Palette.saveToProject(project)
		Sprite.saveToProject(project)
		Browser.saveToProject(project)
		Selector.saveToProject(project)
		PluginManager.saveToProject(project)
		Title.saveToProject(project)

		// 写入项目文件
		const json = JSON.stringify(project, null, 2)
		const last = project.code
		if (json && json !== last) {
			const path = this.config.project
			FSP.writeFile(path, json).catch((error) => {
				Log.throw(error)
			})
		}
	} catch (error) {
		Log.throw(error)
		return console.error(error)
	}
}

// 加载项目文件
// 标签的加载安排到最后
Editor.loadProject = function () {
	const { project } = this
	Scene.loadFromProject(project)
	UI.loadFromProject(project)
	Animation.loadFromProject(project)
	Particle.loadFromProject(project)
	Palette.loadFromProject(project)
	Sprite.loadFromProject(project)
	Browser.loadFromProject(project)
	Selector.loadFromProject(project)
	PluginManager.loadFromProject(project)
	Title.loadFromProject(project)
}

// 保存元数据清单文件
Editor.saveManifest = function () {
	return Data.saveManifest()
}
