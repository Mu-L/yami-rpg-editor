import { ipcRenderer } from 'electron'
import { $ } from '../util/dom.js'
import { Path } from '../util/config.js'
import { FSP } from '../file/file-system.js'
import { Log } from '../log/log-window.js'
import { Editor } from '../main/editor.js'
import { Deployment } from '../title/deploy-project-window.js'
import { Window } from '../tools/window-object.js'
export const WebServer = new (class {
	port = 5959
	constructor() {
		$('#qr-start-button').on('click', () => {
			this.start(Path.slash(Editor.config.project))
		})
		$('#qr-close-button').on('click', () => this.stop())
	}
	get enable() {
		return ipcRenderer.sendSync('get-server-state')
	}
	start(path) {
		ipcRenderer.invoke('start-server', {
			port: this.port,
			path
		})
		window.addEventListener('beforeunload', this.stop)
		this.load()
	}
	toDataUrl(url) {
		return ipcRenderer.invoke('to-qrcode', url)
	}
	getIp() {
		return ipcRenderer.invoke('get-local-ip')
	}
	stop() {
		if (!this.enable) return
		ipcRenderer.invoke('stop-server')
		window.removeEventListener('beforeunload', this.stop)
		this.load()
	}
	load() {
		if (this.enable) {
			$('#qr-start-button').disable()
			$('#qr-close-button').enable()
		} else {
			$('#qr-close-button').disable()
			$('#qr-start-button').enable()
		}
	}
	async open() {
		Window.open('qr-code')
		const ips = await WebServer.getIp()
		let index = 0
		let url = `http://${ips[index]}:${WebServer.port}`
		$('#qr-code-content').innerHTML =
			`<div>IP：${url}</div><div>扫描二维码打开网页</div><div style='color:red'>PS：注意需在同一局域网下扫描二维码</div>
		<div style='color:red'>如果内容没刷新，请Ctrl+S保存场景</div>`
		$('#qr-code-img').src = await WebServer.toDataUrl(url)
		$('#qr-update-button').on('click', async () => {
			index = index >= ips.length - 1 ? 0 : ++index
			url = `http://${ips[index]}:${WebServer.port}`
			$('#qr-code-img').src = await WebServer.toDataUrl(url)
			$('#qr-code-content').innerHTML =
				`<div>IP：${url}</div><div>扫描二维码打开网页</div><div style='color:red'>PS：注意需在同一局域网下扫描二维码</div>
		<div style='color:red'>如果内容没刷新，请Ctrl+S保存场景</div>`
		})
		this.load()
	}
	update(projectPath) {
		if (!this.enable) return
		const path = Path.dirname(projectPath)
		const location = Path.join(path, '.preview')
		return FSP.mkdir(path, { recursive: true })
			.then((done) => {
				$('#deployment-platform').write('web')
				return Deployment.copyFilesTo(location)
			})
			.finally(() => {
				Window.close('copyProgress')
				if (Deployment.timer) {
					Deployment.timer.remove()
					Deployment.timer = null
				}
			})
			.then(() => {
				Editor.config.dialogs.deploy = Path.slash(
					Path.resolve(location)
				)
			})
			.catch((error) => {
				Log.throw(error)
				Window.confirm(
					{
						message: 'Failed to deploy project:\n' + error.message
					}[
						{
							label: 'Confirm'
						}
					]
				)
			})
	}
})()
