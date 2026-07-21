import { ipcRenderer } from 'electron';
import { Data } from '../data/data-object.ts';
import { AudioManager } from '../audio/audio-manager.ts';
import { Browser } from '../browser/project-browser.ts';
import { Selector } from '../browser/resource-selector.ts';
import { Project } from '../data/project-settings-window.ts';
import { Directory } from '../file/directory-object.ts';
import { Inspector } from '../inspector/inspector.ts';
import { Layout } from '../layout/layout.ts';
import { Editor } from './editor.ts';
import { WebServer } from '../module/webserver.ts';
import { Printer } from '../printer/printer.ts';
import { Scene } from '../scene/scene-window.ts';
import { Title } from '../title/title-bar.ts';
import { Window } from '../tools/window-object.ts';
import { UI } from '../ui/ui-window.ts';
import { GL } from '../webgl/webgl-init.ts';

// 关闭项目
Editor.close = function (save = true) {
	Layout.manager.switch(null);
	if (this.state === 'open') {
		this.state = 'closed';
		if (save) {
			this.saveProject();
			this.saveManifest();
		}
		this.switchHotkey(false);
		this.config.project = '';
		this.project = null;
		Window.closeAll();
		Scene.close();
		UI.close();
		Directory.close();
		Inspector.close();
		Browser.close();
		Selector.close();
		Data.close();
		AudioManager.close();
		Printer.clearFonts();
		Project.stopTSC();
		Title.updateTitleName();
		GL.textureManager.clear();
		WebServer.stop();
	}
};

// 退出应用
Editor.quit = function () {
	this.saveConfig();
	this.saveProject();
	this.saveManifest();
	WebServer.stop();
	ipcRenderer.send('force-close-window');
};
