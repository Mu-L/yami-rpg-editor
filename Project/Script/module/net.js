import { fs } from './global.js'
// axios 是 Node 模块，浏览器 ESM 下裸 import 'axios' 解析不了；
// Electron nodeIntegration:true 下用 window.__nodeRequire 桥调 Node require
import axios from 'axios'
export { axios }

// dev 模式下 axios 跨域请求 GitHub raw + jsdelivr CDN 撞浏览器 CORS 政策；
// vite.config.js server.proxy 配了 /github-raw/ → raw.githubusercontent.com 和
// /jsdelivr/ → cdn.jsdelivr.net 代理，dev 模式把 https URL 改写成代理前缀避 CORS
// prod 模式 Electron file:// 协议无 CORS 限制，原样透传
const proxyRewrite = (url) => {
	if (typeof url !== 'string' || !import.meta.env?.DEV) return url
	// 加速节点前缀可能是 https://cdn.jsdelivr.net/gh/... 形式，先剥前缀取原始 GitHub URL
	const rawMatch = url.match(/https:\/\/raw\.githubusercontent\.com(\/.*)$/)
	if (rawMatch) return '/github-raw' + rawMatch[1]
	const jsdelivrMatch = url.match(/https:\/\/cdn\.jsdelivr\.net(\/.*)$/)
	if (jsdelivrMatch) return '/jsdelivr' + jsdelivrMatch[1]
	return url
}

// 包一层 axios.get/post/axios 让 URL 走代理改写
const _axiosGet = axios.get
const _axiosPost = axios.post
axios.get = (url, config) => _axiosGet.call(axios, proxyRewrite(url), config)
axios.post = (url, data, config) =>
	_axiosPost.call(axios, proxyRewrite(url), data, config)

export const Net = new (class {
	get = (url, config) => axios.get(url, config)
	post = (url, data, config) => axios.post(url, data, config)
	cancelQueue = []

	constructor() {
		window.addEventListener('beforeunload', () => this.cancelAllDownloads())
	}

	async downloadFileWithProgress({
		url,
		outputPath,
		onProgress,
		onCancelToken,
		method = 'get'
	}) {
		const source = axios.CancelToken.source()

		this.cancelQueue.push(source)

		if (onCancelToken) {
			onCancelToken(() => source.cancel('用户主动取消下载'))
		}

		try {
			const response = await axios({
				method,
				url,
				responseType: 'blob',
				cancelToken: source.token,
				onDownloadProgress: (progressEvent) => {
					if (onProgress) {
						onProgress(progressEvent)
					}
				}
			})

			// 下载完成后从队列中移除
			this.cancelQueue = this.cancelQueue.filter(
				(item) => item !== source
			)

			if (outputPath) {
				const arrayBuffer = await response.data.arrayBuffer()
				const buffer = Buffer.from(arrayBuffer)
				return fs.writeFileSync(outputPath, buffer)
			} else {
				const arrayBuffer = await response.data.arrayBuffer()
				return Buffer.from(arrayBuffer)
			}
		} catch (err) {
			// 无论成功或失败都从队列中移除
			this.cancelQueue = this.cancelQueue.filter(
				(item) => item !== source
			)

			if (axios.isCancel(err)) {
				console.log('下载已取消：', err.message)
			} else {
				console.error('下载出错：', err)
			}
			throw err
		}
	}

	// 取消所有正在进行的下载
	cancelAllDownloads() {
		this.cancelQueue.forEach((source) => {
			source.cancel('取消所有下载')
		})
		this.cancelQueue = [] // 清空队列
	}
})()
