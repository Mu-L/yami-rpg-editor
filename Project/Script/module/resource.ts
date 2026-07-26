import { ipcRenderer } from 'electron';
import { GlobalPath, Path } from '@/util/config.ts';
import { SettingConfig } from './settingconfig';
import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { Net, axios } from './net.ts';
import {
	fs,
	CommunityVersion,
	PackMeta,
	TemplatesPath,
	isNoResource,
	NoResourceObj,
	unzipWithProgress,
	setPackMeta,
	setNoResourceObj
} from './global.ts';
import { Local } from '@/tools/localization.ts';
export const Resources = new (class {
	window = $('#resource');
	content = $('#resource-content');
	nodeInfoBox = $('#resource-node-info');
	currentNodeText = $('#resource-current-node');
	nodePingText = $('#resource-node-ping');
	_fastGithubArray = [];
	get fastGithubPrefix() {
		const config = SettingConfig.config?.github?.accelerationNode || 'auto';
		if (!this._fastGithubArray) return '';

		switch (config) {
			case 'auto':
				return (
					this._fastGithubArray[
						Math.floor(Math.random() * this._fastGithubArray.length)
					] ?? ''
				);
			case 'none':
				return '';
			default:
				const match = config.match(/^node(\d+)$/);
				if (match) {
					const index = parseInt(match[1]) - 1;
					if (index >= 0 && index < this._fastGithubArray.length) {
						return this._fastGithubArray[index];
					}
				}
				return this._fastGithubArray[0] ?? '';
		}
	}

	loaded = false;

	constructor() {
		this.updateFastGithubArray().then((data) => {
			this._fastGithubArray = data;
		});
	}

	async updateFastGithubArray() {
		const url =
			'https://cdn.jsdelivr.net/gh/Open-Yami-Community/yami-rpg-editor@main/jsons/fastGithubArray.json';
		try {
			const response = await fetch(url, {
				cache: 'no-cache',
				headers: {
					Accept: 'application/json'
				}
			});

			if (!response.ok) return [];
			return await response.json();
		} catch (err) {
			console.warn('获取失败', err);
			return [];
		}
	}

	async initialize() {
		$('#resource-check-version').textContent = Local.get('confirmation.resource-check-version');
		$('#resource-open-dir').textContent = Local.get('confirmation.resource-open-dir');

		$('#resource-check-version').on('click', () => this.checkVersion());
		$('#resource-open-dir').on('click', () => ipcRenderer.send('open-path', GlobalPath));

		void this.updateNodeInfo();
	}

	getCurrentNodeInfo() {
		const config = SettingConfig.config?.github?.accelerationNode || 'auto';
		if (!this._fastGithubArray) return { nodeName: '', nodeUrl: '' };
		const get = Local.createGetter('confirmation');

		let nodeName = '';
		let nodeUrl = '';

		switch (config) {
			case 'auto':
				nodeName = get('github-acceleration-auto') || '自动选择';
				nodeUrl = this.fastGithubPrefix;
				break;
			case 'none':
				nodeName = get('github-acceleration-none') || '不使用加速';
				nodeUrl = 'https://raw.githubusercontent.com/';
				break;
			default:
				const match = config.match(/^node(\d+)$/);
				if (match) {
					const index = parseInt(match[1]) - 1;
					if (index >= 0 && index < this._fastGithubArray.length) {
						nodeUrl = this._fastGithubArray[index];
						const domain = nodeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
						const nodeLabel = get('github-acceleration-node') || '节点';
						nodeName = `${nodeLabel} ${index + 1} (${domain})`;
					}
				}
				break;
		}

		return { nodeName, nodeUrl };
	}

	async getRemoteAnnouncement() {
		try {
			const response = await fetch(
				'https://api.github.com/repos/Open-Yami-Community/yami-rpg-editor/releases'
			);
			if (!response.ok) throw new Error('Failed to fetch announcement');
			const [{ body }] = await response.json();
			return body;
		} catch (error: any) {
			console.warn('Failed to load community announcement:', error);
			return '';
		}
	}

	getFirstAnnouncementContent(text: any) {
		if (!text) return '';

		const lines = text.split('\n');
		const contentLines = [];
		let foundFirstDate = false;

		const dateRegex = /^\s*\d{4}-\d{2}-\d{2}/;

		for (const line of lines) {
			const isDateLine = dateRegex.test(line);

			if (isDateLine) {
				if (!foundFirstDate) {
					foundFirstDate = true;
					continue;
				} else {
					break;
				}
			}

			if (foundFirstDate) {
				contentLines.push(line);
			}
		}

		return contentLines.join('\n').trim();
	}

	async pingNode(url) {
		if (!url) return -1;

		const startTime = Date.now();
		try {
			const testUrl = `${url}Open-Yami-Community/yami-rpg-editor/refs/heads/main/pack.json`;
			const response = await fetch(testUrl, {
				method: 'HEAD',
				cache: 'no-cache'
			});

			if (response.ok) {
				return Date.now() - startTime;
			}
			return -1;
		} catch (error: any) {
			console.warn('Ping failed:', error);
			return -1;
		}
	}

	async updateNodeInfo() {
		const { nodeName, nodeUrl } = this.getCurrentNodeInfo();
		const get = Local.createGetter('confirmation');

		const nodeLabel = get('resource-current-node-label') || '当前节点';
		this.currentNodeText.textContent = `${nodeLabel}: ${nodeName}`;
		this.currentNodeText.style.display = 'block';
		this.currentNodeText.style.visibility = 'visible';

		const testingLabel = get('resource-node-ping-testing') || '测试中';
		this.nodePingText.textContent = `Ping: ${testingLabel}...`;
		this.nodePingText.style.color = '#888';
		this.nodePingText.style.display = 'block';
		this.nodePingText.style.visibility = 'visible';

		const ping = await this.pingNode(nodeUrl);

		if (ping >= 0) {
			let color = '#4caf50';
			if (ping > 1000) {
				color = '#f44336';
			} else if (ping > 500) {
				color = '#ff9800';
			}

			this.nodePingText.textContent = `Ping: ${ping}ms`;
			this.nodePingText.style.color = color;
		} else {
			const failedLabel = get('resource-node-ping-failed') || '失败';
			this.nodePingText.textContent = `Ping: ${failedLabel}`;
			this.nodePingText.style.color = '#f44336';
		}
	}

	/** @description 0 版本一致 | 1 v1版本大 | -1 v2版本大 */
	compareVersions(v1, v2) {
		const normalize = (version) => version.replace(/^v/, '');

		const normalizedV1 = normalize(v1);
		const normalizedV2 = normalize(v2);

		const parts1 = normalizedV1.split('.').map(Number);
		const parts2 = normalizedV2.split('.').map(Number);

		const maxLength = Math.max(parts1.length, parts2.length);

		for (let i = 0; i < maxLength; i++) {
			const num1 = parts1[i] || 0;
			const num2 = parts2[i] || 0;

			if (num1 > num2) return 1;
			if (num1 < num2) return -1;
		}

		return 0;
	}

	async downloadNetMeta() {
		await this.updateFastGithubArray().then((data) => {
			this._fastGithubArray = data;
		});
		const json = `${this.fastGithubPrefix}Open-Yami-Community/yami-rpg-editor/refs/heads/main/pack.json`;
		// .catch 返 { data: [] } 避 GitHub raw 偶发 502 时裸取 .data 炸
		return await Net.get(json, {
			headers: {
				type: 'application/json'
			},
			cache: 'no-cache'
		}).catch((error) => {
			console.log('downloadNetMeta error:', error?.message || error);
			return { data: [] };
		});
	}

	checkResources() {
		setNoResourceObj(isNoResource());
		return (
			NoResourceObj &&
			Object.values<any>(NoResourceObj).every((v) => (typeof v === 'boolean' ? v : v.check))
		);
	}

	formatFileSize(bytes: any) {
		if (bytes < 1024) {
			return `${bytes} B`;
		} else if (bytes < 1024 * 1024) {
			return `${(bytes / 1024).toFixed(2)} KB`;
		} else if (bytes < 1024 * 1024 * 1024) {
			return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
		} else {
			return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
		}
	}

	async getFileSize(resourceName) {
		try {
			const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${resourceName}_pack.zip`;
			const downloadurl = `${this.fastGithubPrefix}${url}`;

			const response = await fetch(downloadurl, {
				method: 'HEAD',
				cache: 'no-cache'
			});

			if (response.ok) {
				const contentLength = response.headers.get('content-length');
				return contentLength ? parseInt(contentLength) : 0;
			}
			return 0;
		} catch (error: any) {
			console.warn('Failed to get file size:', error);
			return 0;
		}
	}

	readTemplate() {
		const tempPath = Path.resolve(TemplatesPath, 'template.json');
		if (!fs.existsSync(tempPath)) {
			fs.writeFileSync(tempPath, JSON.stringify(PackMeta));
			return PackMeta;
		}
		return JSON.parse(fs.readFileSync(tempPath));
	}

	writeTemplate(val: any) {
		const tempPath = Path.resolve(TemplatesPath, 'template.json');
		fs.writeFileSync(tempPath, JSON.stringify(val));
	}

	async checkEditorVersion() {
		const get = Local.createGetter('confirmation');
		const url = `${this.fastGithubPrefix}Open-Yami-Community/yami-rpg-editor/refs/heads/main/Project/Script/module/packmeta.json`;
		const jsonParse = await Net.get(url, {
			headers: {
				type: 'application/json',
				cache: 'no-cache'
			}
		}).catch((error) => {
			console.warn(`checkEditorVersion: ${error.message}`);
			return null;
		});
		if (!jsonParse) return;
		const version = jsonParse.data?.['Community'] ?? '25010100';
		let text = '';
		let isUpdate = false;
		if (CommunityVersion !== version) {
			text = `编辑器 ${CommunityVersion} -> ${version}`;
			isUpdate = true;
		}
		if (isUpdate) {
			const updateText = this.getFirstAnnouncementContent(await this.getRemoteAnnouncement());
			const updateMessage = `${text} \n${'——'.repeat(20)}\n\n${updateText}`;
			Window.confirm(
				{
					message: `${updateMessage} \n${'——'.repeat(20)}\n 编辑器本体需要更新 \n 请到指定地址重新下载编辑器`
				},
				[
					{
						label: get('yes')
					}
				]
			);
		}
	}

	async checkVersion() {
		let isReOpen = false;
		setPackMeta(this.readTemplate());
		// downloadNetMeta 失败兜底空响应
		const netMeta = await this.downloadNetMeta();
		const jsonParse = netMeta?.data ?? [];
		const list = Object.keys(NoResourceObj);

		let versionString = '';

		for (let i of list) {
			const elem = jsonParse.find((v) => v.path === i);
			const elemVersion = elem?.version ?? '1.0.0';
			if (this.compareVersions(elemVersion, PackMeta?.[i] ?? '1.0.0') === 0) {
				continue;
			}
			isReOpen = true;
			versionString += `${i} ${PackMeta[i]} -> ${elemVersion}\n`;
		}

		const get = Local.createGetter('confirmation');
		if (isReOpen) {
			Window.close('resource');
			if (
				!NoResourceObj['arpg-ts-english'].check &&
				!NoResourceObj['arpg-ts-chinese'].check
			) {
				Resources.open();
			}

			Window.confirm({ message: versionString }, [
				{
					label: get('yes')
				}
			]);
		}
		this.checkEditorVersion();
	}

	temp(val: any) {
		const value = val.replace(/[.]/g, '_');
		const targetPath = Path.resolve(TemplatesPath, `${val}_pack.zip`);
		const _check = () => {
			setNoResourceObj(isNoResource());
			if ((NoResourceObj as any)[val].check) {
				button.disable();
				buttonDelete.enable();
				textbox.enable();
				textbox.write(`v${PackMeta[val]}`);
			} else {
				if (!fs.existsSync(tempPath)) buttonDelete.disable();
				button.enable();
				textbox.disable();
				textbox.write('');
			}
			// 判断目录下是否有zip文件，有则删除它节省空间
			if (fs.existsSync(targetPath)) fs.unlink(targetPath);
		};
		const get = Local.createGetter('confirmation');

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
		);
		const boxDom = domPase.body.firstChild;
		this.content.append(boxDom);
		const textbox = boxDom.querySelector('text-box');
		textbox.disable();
		(textbox as any).input.readOnly = true;

		const button = boxDom.querySelector(`#resource-item-${value}-download`);
		const pauseButton = boxDom.querySelector(`#resource-item-${value}-pause`);
		const progressContainer = boxDom.querySelector(`#resource-item-${value}-progress`);
		const progressBar = boxDom.querySelector(`#resource-item-${value}-progress-bar`);
		const progressText = boxDom.querySelector(`#resource-item-${value}-progress-text`);
		const speedText = boxDom.querySelector(`#resource-item-${value}-speed`);
		const sizeText = boxDom.querySelector(`#resource-item-${value}-size`);

		button.textContent = Local.get('confirmation.resource-download');

		this.getFileSize(val)
			.then((size) => {
				const get = Local.createGetter('confirmation');
				const sizeLabel = get('resource-size-label') || '大小';
				if (size > 0) {
					sizeText.textContent = `${sizeLabel}: ${this.formatFileSize(size)}`;
				} else {
					sizeText.textContent = `${sizeLabel}: ${get('resource-size-unknown') || '未知'}`;
				}
			})
			.catch(() => {
				const get = Local.createGetter('confirmation');
				const sizeLabel = get('resource-size-label') || '大小';
				sizeText.textContent = `${sizeLabel}: ${get('resource-size-unknown') || '未知'}`;
			});

		let cancelDownload = null;
		let isDownloading = false;
		let isDecompressing = false;
		let lastLoaded = 0;
		let lastTime = Date.now();

		button.on('click', () => {
			if (isDownloading || isDecompressing) return;
			const url = `https://github.com/Open-Yami-Community/yami-rpg-editor/releases/download/win/${val}_pack.zip`;
			const downloadurl = `${this.fastGithubPrefix}${url}`;

			isDownloading = true;
			button.disable();
			pauseButton.style.display = 'inline-block';
			pauseButton.textContent = Local.get('confirmation.resource-pause') || '暂停';
			progressContainer.style.display = 'flex';

			progressBar.style.width = '0%';
			progressText.textContent = '0%';
			speedText.textContent = Local.get('confirmation.resource-speed') || '速度: 0 KB/s';
			lastLoaded = 0;
			lastTime = Date.now();

			Net.downloadFileWithProgress({
				url: downloadurl,
				outputPath: targetPath,
				onCancelToken: (cancel) => {
					cancelDownload = cancel;
				},
				onProgress: (progressEvent) => {
					if (!isDownloading) return;

					const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);

					progressBar.style.width = `${percent}%`;
					progressText.textContent = `${percent}%`;

					const now = Date.now();
					const timeDiff = (now - lastTime) / 1000;
					const loadedDiff = progressEvent.loaded - lastLoaded;

					if (timeDiff > 0.5) {
						const speed = loadedDiff / timeDiff;
						let speedText_str = '';

						if (speed < 1024) {
							speedText_str = `${speed.toFixed(0)} B/s`;
						} else if (speed < 1024 * 1024) {
							speedText_str = `${(speed / 1024).toFixed(2)} KB/s`;
						} else {
							speedText_str = `${(speed / 1024 / 1024).toFixed(2)} MB/s`;
						}

						const speedLabel = Local.get('confirmation.resource-speed-label') || '速度';
						speedText.textContent = `${speedLabel}: ${speedText_str}`;

						lastLoaded = progressEvent.loaded;
						lastTime = now;
					}
				}
			})
				.then(() => {
					isDownloading = false;
					isDecompressing = true;
					progressContainer.style.display = 'none';
					pauseButton.style.display = 'none';

					button.textContent = Local.get('confirmation.resource-decompression');
					button.disable();
					progressContainer.style.display = 'flex';
					progressBar.style.background = 'linear-gradient(90deg, #2196f3, #42a5f5)';

					unzipWithProgress({
						zipPath: targetPath,
						outputDir: Path.resolve(Path.dirname(targetPath), val),
						onProgress: (percent) => {
							progressBar.style.width = `${percent}%`;
							progressText.textContent = `${percent}%`;
						}
					})
						.then(async () => {
							const remoteData = (await this.downloadNetMeta()).data;
							const j = this.readTemplate();
							j[val] = remoteData.find((v) => val === v.path)?.version ?? '1.0.0';
							this.writeTemplate(j);
							setPackMeta(this.readTemplate());
							isDecompressing = false;
							_check();
							button.textContent = Local.get('confirmation.resource-download');
							progressContainer.style.display = 'none';
							progressBar.style.background =
								'linear-gradient(90deg, #4caf50, #66bb6a)';
						})
						.catch((e) => {
							isDecompressing = false;
							button.enable();
							progressContainer.style.display = 'none';
							progressBar.style.background =
								'linear-gradient(90deg, #4caf50, #66bb6a)';

							Window.confirm({ message: e.message }, [
								{
									label: get('yes')
								}
							]);
						});
				})
				.catch((e) => {
					isDownloading = false;
					isDecompressing = false;
					button.enable();
					pauseButton.style.display = 'none';
					progressContainer.style.display = 'none';

					if (!axios.isCancel(e)) {
						Window.confirm({ message: e.message }, [
							{
								label: get('yes')
							}
						]);
					}
				});
		});

		pauseButton.on('click', () => {
			if (!isDownloading) return;

			if (cancelDownload) {
				cancelDownload();
				cancelDownload = null;
			}

			isDownloading = false;
			button.enable();
			pauseButton.style.display = 'none';
			progressContainer.style.display = 'none';
		});

		const buttonDelete = boxDom.querySelector(`#resource-item-${value}-delete`);
		buttonDelete.textContent = Local.get('common.delete');
		const tempPath = Path.resolve(TemplatesPath, val);
		buttonDelete.on('click', () => {
			if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true, force: true });
			_check();
		});
		_check();
	}

	load() {
		setNoResourceObj(isNoResource());
		this.content.innerHTML = '';
		const list = Object.keys(NoResourceObj);
		for (let i of list) {
			this.temp(i);
		}
	}

	async open() {
		Window.open('resource');
		this.updateNodeInfo();
		this.load();
	}
})();
