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
		return await Net.get(json, {
			Headers: {
				type: 'application/json',
				'Cache-Control': 'no-cache'
			}
		})
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

	// 格式化文件大小
	formatFileSize(bytes) {
		if (bytes < 1024) {
			return `${bytes} B`
		} else if (bytes < 1024 * 1024) {
			return `${(bytes / 1024).toFixed(2)} KB`
		} else if (bytes < 1024 * 1024 * 1024) {
			return `${(bytes / 1024 / 1024).toFixed(2)} MB`
		} else {
			return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
		}
	}

	// 获取文件大小
	async getFileSize(resourceName) {
		try {
			const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${resourceName}_pack.zip`
			const downloadurl = `${this.fastGithubPrefix}${url}`

			const response = await fetch(downloadurl, {
				method: 'HEAD',
				cache: 'no-cache'
			})

			if (response.ok) {
				const contentLength = response.headers.get('content-length')
				return contentLength ? parseInt(contentLength) : 0
			}
			return 0
		} catch (error) {
			console.error('Failed to get file size:', error)
			return 0
		}
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
			`<box id="resource-item-${value}" class='resource-item' style="display: flex; flex-direction: column; padding: 10px; margin: 5px 0; border: 1px solid var(--border-color); border-radius: 4px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <text style="flex: 0 0 auto;">${value}:&emsp;</text>
          <text-box style="flex: 1;"></text-box>
          <button id='resource-item-${value}-download' name='resource-download'></button>
          <button id='resource-item-${value}-pause' name='pause' style="display: none;">暂停</button>
          <button id='resource-item-${value}-delete' name='delete'></button>
        </div>
        <div id='resource-item-${value}-progress' style="display: none; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 20px; background: var(--panel-background); border: 1px solid var(--border-color); border-radius: 3px; overflow: hidden;">
              <div id='resource-item-${value}-progress-bar' style="height: 100%; background: linear-gradient(90deg, #4caf50, #66bb6a); transition: width 0.3s; width: 0%;"></div>
            </div>
            <text id='resource-item-${value}-progress-text' style="flex: 0 0 auto; min-width: 50px; text-align: right;">0%</text>
          </div>
          <text id='resource-item-${value}-speed' style="font-size: 12px; color: #888;">速度: 0 KB/s</text>
        </div>
        <text id='resource-item-${value}-size' style="font-size: 12px; color: #888; margin-top: 4px;">大小: 获取中...</text>
        </box>`,
			'text/html'
		)
		const boxDom = domPase.body.firstChild
		this.content.append(boxDom)
		const textbox = boxDom.querySelector('text-box')
		textbox.disable()
		textbox.input.readOnly = true

		const button = boxDom.querySelector(`#resource-item-${value}-download`)
		const pauseButton = boxDom.querySelector(
			`#resource-item-${value}-pause`
		)
		const progressContainer = boxDom.querySelector(
			`#resource-item-${value}-progress`
		)
		const progressBar = boxDom.querySelector(
			`#resource-item-${value}-progress-bar`
		)
		const progressText = boxDom.querySelector(
			`#resource-item-${value}-progress-text`
		)
		const speedText = boxDom.querySelector(`#resource-item-${value}-speed`)
		const sizeText = boxDom.querySelector(`#resource-item-${value}-size`)

		button.textContent = Local.get('confirmation.resource-download')

		// 获取文件大小
		this.getFileSize(val)
			.then((size) => {
				const get = Local.createGetter('confirmation')
				const sizeLabel = get('resource-size-label') || '大小'
				if (size > 0) {
					sizeText.textContent = `${sizeLabel}: ${this.formatFileSize(size)}`
				} else {
					sizeText.textContent = `${sizeLabel}: ${get('resource-size-unknown') || '未知'}`
				}
			})
			.catch(() => {
				const get = Local.createGetter('confirmation')
				const sizeLabel = get('resource-size-label') || '大小'
				sizeText.textContent = `${sizeLabel}: ${get('resource-size-unknown') || '未知'}`
			})

		// 下载状态管理
		let cancelDownload = null
		let isDownloading = false
		let isDecompressing = false
		let lastLoaded = 0
		let lastTime = Date.now()

		// 绑定下载
		button.on('click', () => {
			// 防止重复点击
			if (isDownloading || isDecompressing) return
			const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${val}_pack.zip`
			const downloadurl = `${this.fastGithubPrefix}${url}`

			isDownloading = true
			button.disable()
			pauseButton.style.display = 'inline-block'
			pauseButton.textContent =
				Local.get('confirmation.resource-pause') || '暂停'
			progressContainer.style.display = 'flex'

			// 重置进度
			progressBar.style.width = '0%'
			progressText.textContent = '0%'
			speedText.textContent =
				Local.get('confirmation.resource-speed') || '速度: 0 KB/s'
			lastLoaded = 0
			lastTime = Date.now()

			Net.downloadFileWithProgress({
				url: downloadurl,
				outputPath: targetPath,
				onCancelToken: (cancel) => {
					cancelDownload = cancel
				},
				onProgress: (progressEvent) => {
					if (!isDownloading) return

					const percent = Math.round(
						(progressEvent.loaded / progressEvent.total) * 100
					)

					// 更新进度条和百分比
					progressBar.style.width = `${percent}%`
					progressText.textContent = `${percent}%`

					// 计算速度
					const now = Date.now()
					const timeDiff = (now - lastTime) / 1000 // 秒
					const loadedDiff = progressEvent.loaded - lastLoaded

					if (timeDiff > 0.5) {
						// 每0.5秒更新一次速度
						const speed = loadedDiff / timeDiff // 字节/秒
						let speedText_str = ''

						if (speed < 1024) {
							speedText_str = `${speed.toFixed(0)} B/s`
						} else if (speed < 1024 * 1024) {
							speedText_str = `${(speed / 1024).toFixed(2)} KB/s`
						} else {
							speedText_str = `${(speed / 1024 / 1024).toFixed(2)} MB/s`
						}

						const speedLabel =
							Local.get('confirmation.resource-speed-label') ||
							'速度'
						speedText.textContent = `${speedLabel}: ${speedText_str}`

						lastLoaded = progressEvent.loaded
						lastTime = now
					}
				}
			})
				.then(() => {
					isDownloading = false
					isDecompressing = true
					progressContainer.style.display = 'none'
					pauseButton.style.display = 'none'

					// 开始解压
					button.textContent = Local.get(
						'confirmation.resource-decompression'
					)
					button.disable()
					progressContainer.style.display = 'flex'
					progressBar.style.background =
						'linear-gradient(90deg, #2196f3, #42a5f5)'

					unzipWithProgress({
						zipPath: targetPath,
						outputDir: Path.resolve(Path.dirname(targetPath), val),
						onProgress: (percent) => {
							progressBar.style.width = `${percent}%`
							progressText.textContent = `${percent}%`
						}
					})
						.then(async () => {
							// 更新template.json本地版本号
							const remoteData = (await this.downloadNetMeta())
								.data
							const j = this.readTemplate()
							j[val] =
								remoteData.find((v) => val === v.path)
									?.version ?? '1.0.0'
							this.writeTemplate(j)
							// 下载完成，也解压完成
							PackMeta = this.readTemplate() // 重新读取本地模板信息
							isDecompressing = false
							_check()
							button.textContent = Local.get(
								'confirmation.resource-download'
							)
							progressContainer.style.display = 'none'
							progressBar.style.background =
								'linear-gradient(90deg, #4caf50, #66bb6a)'
						})
						.catch((e) => {
							// 解压失败
							isDecompressing = false
							button.enable()
							progressContainer.style.display = 'none'
							progressBar.style.background =
								'linear-gradient(90deg, #4caf50, #66bb6a)'

							Window.confirm({ message: e.message }, [
								{
									label: get('yes')
								}
							])
						})
				})
				.catch((e) => {
					isDownloading = false
					isDecompressing = false
					button.enable()
					pauseButton.style.display = 'none'
					progressContainer.style.display = 'none'

					if (!axios.isCancel(e)) {
						Window.confirm({ message: e.message }, [
							{
								label: get('yes')
							}
						])
					}
				})
		})

		// 绑定暂停
		pauseButton.on('click', () => {
			// 防止重复点击
			if (!isDownloading) return

			// 取消下载
			if (cancelDownload) {
				cancelDownload()
				cancelDownload = null
			}

			isDownloading = false
			button.enable()
			pauseButton.style.display = 'none'
			progressContainer.style.display = 'none'
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
