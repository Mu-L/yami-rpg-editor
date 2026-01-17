const Resources = new (class {
	isStart = false // 首次启动显示
	window = $('#resource')
	content = $('#resource-content')
	nodeInfoBox = $('#resource-node-info')
	currentNodeText = $('#resource-current-node')
	nodePingText = $('#resource-node-ping')
	fastGithubArray = [
		'https://cdn.gh-proxy.com/',
		'https://proxy.pipers.cn/',
		'https://gh.jasonzeng.dev/',
		'https://ghfast.top/'
	]
	get fastGithubPrefix() {
		const config = SettingConfig.config?.github?.accelerationNode || 'auto'

		switch (config) {
			case 'auto':
				return this.fastGithubArray[
					Math.floor(Math.random() * this.fastGithubArray.length)
				]
			case 'none':
				return ''
			default:
				const match = config.match(/^node(\d+)$/)
				if (match) {
					const index = parseInt(match[1]) - 1
					if (index >= 0 && index < this.fastGithubArray.length) {
						return this.fastGithubArray[index]
					}
				}
				return this.fastGithubArray[0]
		}
	}
	loaded = false
	constructor() {
		$('#resource-check-version').on('click', () => this.checkVersion())
		$('#resource-open-dir').on('click', () =>
			require('electron').ipcRenderer.send('open-path', GlobalPath)
		)
	}
	initialize() {
		// 更新本地化
		$('#resource-check-version').textContent = Local.get(
			'confirmation.resource-check-version'
		)
		$('#resource-open-dir').textContent = Local.get(
			'confirmation.resource-open-dir'
		)

		// 更新节点信息
		this.updateNodeInfo()
	}

	getCurrentNodeInfo() {
		const config = SettingConfig.config?.github?.accelerationNode || 'auto'
		const get = Local.createGetter('confirmation')

		let nodeName = ''
		let nodeUrl = ''

		switch (config) {
			case 'auto':
				nodeName = get('github-acceleration-auto') || '自动选择'
				nodeUrl = this.fastGithubPrefix
				break
			case 'none':
				nodeName = get('github-acceleration-none') || '不使用加速'
				nodeUrl = 'https://raw.githubusercontent.com/'
				break
			default:
				const match = config.match(/^node(\d+)$/)
				if (match) {
					const index = parseInt(match[1]) - 1
					if (index >= 0 && index < this.fastGithubArray.length) {
						nodeUrl = this.fastGithubArray[index]
						const domain = nodeUrl
							.replace(/^https?:\/\//, '')
							.replace(/\/$/, '')
						const nodeLabel =
							get('github-acceleration-node') || '节点'
						nodeName = `${nodeLabel} ${index + 1} (${domain})`
					}
				}
				break
		}

		return { nodeName, nodeUrl }
	}

	// 测试节点 ping
	async pingNode(url) {
		if (!url) return -1

		const startTime = Date.now()
		try {
			// 使用 HEAD 请求测试连接速度
			const testUrl =
				url +
				'https://raw.githubusercontent.com/Open-Yami-Community/yami-rpg-editor/refs/heads/main/pack.json'
			const response = await fetch(testUrl, {
				method: 'HEAD',
				cache: 'no-cache'
			})

			if (response.ok) {
				return Date.now() - startTime
			}
			return -1
		} catch (error) {
			console.error('Ping failed:', error)
			return -1
		}
	}

	// 更新节点信息显示
	async updateNodeInfo() {
		const { nodeName, nodeUrl } = this.getCurrentNodeInfo()
		const get = Local.createGetter('confirmation')

		// 更新节点名称
		const nodeLabel = get('resource-current-node-label') || '当前节点'
		this.currentNodeText.textContent = `${nodeLabel}: ${nodeName}`
		this.currentNodeText.style.display = 'block'
		this.currentNodeText.style.visibility = 'visible'

		// 显示测试中
		const testingLabel = get('resource-node-ping-testing') || '测试中'
		this.nodePingText.textContent = `Ping: ${testingLabel}...`
		this.nodePingText.style.color = '#888'
		this.nodePingText.style.display = 'block'
		this.nodePingText.style.visibility = 'visible'

		// 测试 ping
		const ping = await this.pingNode(nodeUrl)

		if (ping >= 0) {
			let color = '#4caf50' // 绿色
			if (ping > 1000) {
				color = '#f44336' // 红色
			} else if (ping > 500) {
				color = '#ff9800' // 橙色
			}

			this.nodePingText.textContent = `Ping: ${ping}ms`
			this.nodePingText.style.color = color
		} else {
			const failedLabel = get('resource-node-ping-failed') || '失败'
			this.nodePingText.textContent = `Ping: ${failedLabel}`
			this.nodePingText.style.color = '#f44336' // 红色
		}
	}

	/** 
    @description 0 版本一致 | 1 v1版本大 | -1 v2版本大
	*/
	compareVersions(v1, v2) {
		const normalize = (version) => version.replace(/^v/, '')

		const normalizedV1 = normalize(v1)
		const normalizedV2 = normalize(v2)

		const parts1 = normalizedV1.split('.').map(Number)
		const parts2 = normalizedV2.split('.').map(Number)

		const maxLength = Math.max(parts1.length, parts2.length)

		for (let i = 0; i < maxLength; i++) {
			const num1 = parts1[i] || 0
			const num2 = parts2[i] || 0

			if (num1 > num2) return 1
			if (num1 < num2) return -1
		}

		return 0
	}

	// 下载远程资源信息
	async downloadNetMeta() {
		const json = `${this.fastGithubPrefix}https://raw.githubusercontent.com/Open-Yami-Community/yami-rpg-editor/refs/heads/main/pack.json`
		return await Net.get(json)
	}

	checkResources() {
		NoResourceObj = isNoResource()
		return (
			NoResourceObj &&
			Object.values(NoResourceObj).every((v) =>
				typeof v === 'boolean' ? v : v.check
			)
		)
	}

	// 读取本地 tempalte.json
	readTemplate() {
		const tempPath = Path.resolve(TemplatesPath, 'template.json')
		if (!fs.existsSync(tempPath)) {
			fs.writeFileSync(tempPath, JSON.stringify(PackMeta))
			return PackMeta
		}
		return JSON.parse(fs.readFileSync(tempPath))
	}
	// 写入本地 tempalte.json
	writeTemplate(val) {
		const tempPath = Path.resolve(TemplatesPath, 'template.json')
		fs.writeFileSync(tempPath, JSON.stringify(val))
	}

	async checkEditorVersion() {
		const get = Local.createGetter('confirmation')
		const url = `${this.fastGithubPrefix}https://raw.githubusercontent.com/Open-Yami-Community/yami-rpg-editor/refs/heads/main/Project/Script/module/packmeta.json`
		const jsonParse = await Net.get(url, {
			Headers: {
				type: 'application/json'
			}
		})
		if (!jsonParse) return
		const version = jsonParse.data?.['Community'] ?? '25010100'
		let text = ''
		let isUpdate = false
		if (CommunityVersion !== version) {
			// 需要更新(Editor)
			text = `编辑器 ${CommunityVersion} -> ${version}`
			isUpdate = true
		}
		if (isUpdate) {
			Window.confirm(
				{
					message: `${text} \n 编辑器本体需要更新 \n 请到指定地址重新下载编辑器`
				},
				[
					{
						label: get('yes')
					}
				]
			)
		}
	}

	async checkVersion() {
		let isReOpen = false
		PackMeta = this.readTemplate() // 读取本地模板信息
		const jsonParse = (await this.downloadNetMeta()).data
		const list = Object.keys(NoResourceObj)

		let versionString = ''

		for (let i of list) {
			const elem = jsonParse.find((v) => v.path === i)
			if (
				this.compareVersions(elem.version, PackMeta?.[i] ?? '1.0.0') ===
				0
			) {
				continue
			}
			isReOpen = true
			versionString += `${i} ${PackMeta[i]} -> ${elem.version}\n`
		}

		const get = Local.createGetter('confirmation')
		if (isReOpen) {
			Window.close('resource')
			Resources.open(true)

			Window.confirm({ message: versionString }, [
				{
					label: get('yes')
				}
			])
		}
		this.checkEditorVersion()
	}

	temp(val) {
		const value = val.replace(/[.]/g, '_') // dom id 不能特殊字符
		const targetPath = Path.resolve(TemplatesPath, `${val}_pack.zip`)
		const _check = () => {
			NoResourceObj = isNoResource() // 更新最新数据
			if (NoResourceObj[val].check) {
				button.disable()
				buttonDelete.enable()
				textbox.enable()
				textbox.write(`v${PackMeta[val]}`)
			} else {
				if (!fs.existsSync(tempPath)) buttonDelete.disable()
				button.enable()
				textbox.disable()
				textbox.write('')
			}
			// 判断目录下是否有zip文件，有则删除它节省空间
			if (fs.existsSync(targetPath)) fs.unlink(targetPath)
			if (this.isStart && this.checkResources()) {
				this.window
					.querySelector('title-bar')
					.append(document.createElement('close'))
			}
		}
		const get = Local.createGetter('confirmation')

		const domPase = new DOMParser().parseFromString(
			`<box id="resource-item-${value}" class='resource-item'>
        <text>${value}:&emsp;</text>
        <text-box></text-box>
        <button id='resource-item-${value}-download' name='resource-download'></button>
        <button id='resource-item-${value}-delete' name='delete'></button>
        </box>`,
			'text/html'
		)
		const boxDom = domPase.body.firstChild
		this.content.append(boxDom)
		const textbox = boxDom.querySelector('text-box')
		textbox.disable()
		textbox.input.readOnly = true
		const button = boxDom.querySelector(`#resource-item-${value}-download`)
		button.textContent = Local.get('confirmation.resource-download')
		// 绑定下载
		button.on('click', () => {
			const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${val}_pack.zip`
			const downloadurl = `${this.fastGithubPrefix}${url}`
			button.disable()
			button.textContent = Local.get('confirmation.resource-download')
			Net.downloadFileWithProgress({
				url: downloadurl,
				outputPath: targetPath,
				onProgress: (progressEvent) => {
					const percent = Math.round(
						(progressEvent.loaded / progressEvent.total) * 100
					)
					button.textContent = `${Local.get('confirmation.resource-download')}:${percent}%`
				}
			})
				.then(() => {
					unzipWithProgress({
						zipPath: targetPath,
						outputDir: Path.resolve(Path.dirname(targetPath), val),
						onProgress: (percent) => {
							button.textContent = `${Local.get('confirmation.resource-decompression')}:${percent}%`
						}
					}).then(async () => {
						// 更新template.json本地版本号
						const remoteData = (await this.downloadNetMeta()).data
						const j = this.readTemplate()
						j[val] =
							remoteData.find((v) => val === v.path)?.version ??
							'1.0.0'
						this.writeTemplate(j)
						// 下载完成，也解压完成
						PackMeta = this.readTemplate() // 重新读取本地模板信息
						_check()
						button.textContent = Local.get(
							'confirmation.resource-download'
						)
					})
				})
				.catch((e) => {
					button.enable()
					Window.confirm({ message: e.message }, [
						{
							label: get('yes')
						}
					])
				})
		})

		const buttonDelete = boxDom.querySelector(
			`#resource-item-${value}-delete`
		)
		buttonDelete.textContent = Local.get('common.delete')
		const tempPath = Path.resolve(TemplatesPath, val)
		buttonDelete.on('click', () => {
			if (fs.existsSync(tempPath))
				fs.rmSync(tempPath, { recursive: true, force: true })
			_check()
		})
		_check()
	}

	// 加载列表
	load() {
		NoResourceObj = isNoResource()
		if (this.isStart) {
			if (this.window) this.window.querySelector('close')?.remove()
		}
		this.content.innerHTML = ''
		const list = Object.keys(NoResourceObj)
		for (let i of list) {
			this.temp(i)
		}
	}

	async open(val) {
		this.isStart = val
		Window.open('resource')
		this.updateNodeInfo() // 更新节点信息
		this.load()
	}
})()
