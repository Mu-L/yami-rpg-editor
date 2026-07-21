import { ipcRenderer } from 'electron';
import { $ } from '../util/dom.ts';
import { Path } from '../util/config.ts';
import { Editor } from '../main/editor.ts';
import { TemplatesPath } from './global.ts';
export const ApkBuilder = new (class {
	logs = [];
	constructor() {
		ipcRenderer.on('apk-log', (_, log) => {
			this.logs.push(log);
			this.apkLog(log);
		});
	}
	build(cfg) {
		$('#export-apk-content').clear();
		const config = this.process(cfg);
		ipcRenderer.invoke('build-apk', config);
	}
	apkLog(log) {
		const text = document.createElement('text');
		text.textContent = log.msg;
		text.addClass('export-apk-major');
		$('#export-apk-content').appendChild(text);
		if (log.done) {
			$('#export-apk-button').enable();
		}
		$('#export-apk-container').scrollTo({
			top: $('#export-apk-container').scrollHeight
		});
	}
	reset() {
		$('#export-apk-content').clear();
		$('#export-apk-button').enable();
	}
	clearLog() {
		this.logs = [];
	}
	stopBuild() {
		ipcRenderer.invoke('stop-build-apk').then(() => {
			this.reset();
		});
	}
	isBuilding() {
		return ipcRenderer.sendSync('isBuilding-apk');
	}
	processPathOnly(line) {
		const pathPrefix = Path.resolve(
			Path.dirname(Editor.config.project),
			'apk'
		);
		if (typeof line === 'string' && line?.startsWith('@')) {
			return Path.resolve(TemplatesPath, 'Apk', line.replace('@', '.'));
		} else if (typeof line === 'string' && line?.startsWith('$')) {
			return Path.resolve(pathPrefix, line.replace('$', '.'));
		} else if (typeof line === 'string' && line?.startsWith('~')) {
			return Path.resolve(
				Path.dirname(Editor.config.project),
				line.replace('~', '.')
			);
		}
		return line;
	}
	process(cfg) {
		const config = JSON.parse(JSON.stringify(cfg));
		const list = Object.keys(config);
		list.forEach((v) => {
			config[v] = this.processPathOnly(config[v]);
		});
		config.projectPath = Path.dirname(Editor.config.project);
		console.log(config);
		return config;
	}
})();
