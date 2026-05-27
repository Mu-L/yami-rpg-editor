const fs = require('fs-extra')
const path = require('path')
const archiver = require('archiver')

// 配置
const runtimeConfig = {
	folders: [
		{
			sourceDir: 'Project/Templates/electron-win-x64',
			zipPath: 'Templates/electron-win-x64'
		},
		{
			sourceDir: 'Project/Templates/electron-mac-universal.app',
			zipPath: 'Templates/electron-mac-universal.app'
		}
	],
	output: 'build/runtime/runtime.zip',
	splitSizeMB: 100
}

// 分卷压缩函数
async function splitArchive(zipPath, splitSizeMB) {
	const splitSize = splitSizeMB * 1024 * 1024
	const stats = await fs.stat(zipPath)
	const totalSize = stats.size
	const totalParts = Math.ceil(totalSize / splitSize)

	const fileBuffer = await fs.readFile(zipPath)
	const outputDir = path.dirname(zipPath)
	const baseName = path.basename(zipPath, '.zip')

	console.log(
		`开始分卷压缩，总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB，分卷大小: ${splitSizeMB}MB，共 ${totalParts} 卷`
	)

	for (let i = 0; i < totalParts; i++) {
		const start = i * splitSize
		const end = Math.min(start + splitSize, totalSize)
		const chunk = fileBuffer.slice(start, end)

		// 生成分卷文件名，格式为: runtime.zip.001, runtime.zip.002, ...
		const partNumber = String(i + 1).padStart(3, '0')
		const partPath = path.join(outputDir, `${baseName}.zip.${partNumber}`)

		await fs.writeFile(partPath, chunk)
		console.log(
			`已创建分卷 ${i + 1}/${totalParts}: ${partPath} (${(chunk.length / 1024 / 1024).toFixed(2)}MB)`
		)
	}

	// 删除原始zip文件
	await fs.unlink(zipPath)
	console.log('分卷压缩完成！')
}

// 创建压缩包函数
async function createArchive() {
	try {
		// 确保输出目录存在
		await fs.ensureDir(path.dirname(runtimeConfig.output))

		// 创建输出流
		const output = fs.createWriteStream(runtimeConfig.output)
		const archive = archiver('zip', {
			zlib: { level: 9 } // 最高压缩级别
		})

		// 监听压缩完成事件
		output.on('close', async () => {
			console.log(`压缩完成，总大小: ${archive.pointer()} bytes`)
			// 执行分卷压缩
			await splitArchive(runtimeConfig.output, runtimeConfig.splitSizeMB)
		})

		// 监听错误事件
		archive.on('error', (err) => {
			throw err
		})

		// 连接输出流
		archive.pipe(output)

		// 添加文件夹到压缩包
		for (const folder of runtimeConfig.folders) {
			const sourcePath = path.resolve(folder.sourceDir)
			if (await fs.pathExists(sourcePath)) {
				console.log(`正在添加: ${sourcePath}`)
				archive.directory(sourcePath, folder.zipPath)
			} else {
				console.warn(`警告: 源目录不存在: ${sourcePath}`)
			}
		}

		// 完成压缩
		await archive.finalize()
	} catch (error) {
		console.error('压缩过程中出错:', error)
		process.exit(1)
	}
}

// 执行打包
createArchive()
