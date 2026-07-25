import { fs } from './global.ts';
// axios 是 Node 模块，浏览器 ESM 下裸 import 'axios' 解析不了；Electron nodeIntegration:true 下用 window.__nodeRequire 桥调 Node require
import axios from 'axios';
export { axios };

const proxyRewrite = (url) => {
	if (typeof url !== 'string' || !(import.meta as any).env?.DEV) return url;
	const rawMatch = url.match(/https:\/\/raw\.githubusercontent\.com(\/.*)$/);
	if (rawMatch) return '/github-raw' + rawMatch[1];
	const jsdelivrMatch = url.match(/https:\/\/cdn\.jsdelivr\.net(\/.*)$/);
	if (jsdelivrMatch) return '/jsdelivr' + jsdelivrMatch[1];
	return url;
};

const _axiosGet = axios.get;
const _axiosPost = axios.post;
axios.get = (url, config) => _axiosGet.call(axios, proxyRewrite(url), config);
axios.post = (url, data, config) => _axiosPost.call(axios, proxyRewrite(url), data, config);

export const Net = new (class {
	get = (url, config) => axios.get(url, config);
	post = (url, data, config) => axios.post(url, data, config);
	cancelQueue = [];

	constructor() {
		window.addEventListener('beforeunload', () => this.cancelAllDownloads());
	}

	async downloadFileWithProgress({ url, outputPath, onProgress, onCancelToken, method = 'get' }) {
		const source = axios.CancelToken.source();

		this.cancelQueue.push(source);

		if (onCancelToken) {
			onCancelToken(() => source.cancel('用户主动取消下载'));
		}

		try {
			const response = await axios({
				method,
				url,
				responseType: 'blob',
				cancelToken: source.token,
				onDownloadProgress: (progressEvent) => {
					if (onProgress) {
						onProgress(progressEvent);
					}
				}
			});

			this.cancelQueue = this.cancelQueue.filter((item) => item !== source);

			if (outputPath) {
				const arrayBuffer = await response.data.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				return fs.writeFileSync(outputPath, buffer);
			} else {
				const arrayBuffer = await response.data.arrayBuffer();
				return Buffer.from(arrayBuffer);
			}
		} catch (err) {
			this.cancelQueue = this.cancelQueue.filter((item) => item !== source);

			if (axios.isCancel(err)) {
				console.log('下载已取消：', err.message);
			} else {
				console.error('下载出错：', err);
			}
			throw err;
		}
	}

	cancelAllDownloads() {
		this.cancelQueue.forEach((source) => {
			source.cancel('取消所有下载');
		});
		this.cancelQueue = [];
	}
})();
