'use strict'
import { ipcRenderer } from 'electron'
import { Data } from '../data/data-object.js'
import { AudioManager } from '../audio/audio-manager.js'
import { Browser } from '../browser/project-browser.js'
import { Selector } from '../browser/resource-selector.js'
import { Project } from '../data/project-settings-window.js'
import { Directory } from '../file/directory-object.js'
import { Inspector } from '../inspector/inspector.js'
import { Layout } from '../layout/layout.js'
import { Editor } from './editor.js'
import { WebServer } from '../module/webserver.js'
import { Printer } from '../printer/printer.js'
import { Scene } from '../scene/scene-window.js'
import { Title } from '../title/title-bar.js'
import { Window } from '../tools/window-object.js'
import { UI } from '../ui/ui-window.js'
import { GL } from '../webgl/webgl-init.js'

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
	ipcRenderer.send('force-close-window')
}
