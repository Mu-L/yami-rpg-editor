'use strict'
const require = window.__nodeRequire || window.require

// 关闭项目
Editor.close = function (save = true) {
	Layout.manager.switch(null)
	if (this.state === 'open') {
		this.state = 'closed'
		if (save) {
			this.saveProject()
			this.saveManifest()
		}
		this.switchHotkey(false)
		this.config.project = ''
		this.project = null
		Window.closeAll()
		Scene.close()
		UI.close()
		Directory.close()
		Inspector.close()
		Browser.close()
		Selector.close()
		Data.close()
		AudioManager.close()
		Printer.clearFonts()
		Project.stopTSC()
		Title.updateTitleName()
		GL.textureManager.clear()
		WebServer.stop()
	}
}

// 退出应用
Editor.quit = function () {
	this.saveConfig()
	this.saveProject()
	this.saveManifest()
	WebServer.stop()
	require('electron').ipcRenderer.send('force-close-window')
}
