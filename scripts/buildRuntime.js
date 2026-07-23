const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// 进度显示工具函数
function showProgress(current, total, label = '进度') {
	const percentage = Math.min((current / total) * 100, 100).toFixed(1);
	const barLength = 50;
	const filled = Math.min(Math.floor((current / total) * barLength), barLength);
	const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, barLength - filled));
	process.stdout.write(`\r${label}: [${bar}] ${percentage}%`);
}

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
	output: 'Runtime/electron-packages',
	splitSizeMB: 100
};

// 分卷压缩函数
async function splitArchive(zipPath, splitSizeMB) {
	const splitSize = splitSizeMB * 1024 * 1024;
	const stats = await fs.stat(zipPath);
	const totalSize = stats.size;
	const totalParts = Math.ceil(totalSize / splitSize);

	const fileBuffer = await fs.readFile(zipPath);
	const outputDir = path.dirname(zipPath);
	const baseName = path.basename(zipPath, '.zip');

	console.log(
		`\n开始分卷压缩，总大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB，分卷大小: ${splitSizeMB}MB，共 ${totalParts} 卷\n`
	);

	for (let i = 0; i < totalParts; i++) {
		const start = i * splitSize;
		const end = Math.min(start + splitSize, totalSize);
		const chunk = fileBuffer.slice(start, end);

		// 生成分卷文件名，格式为: runtime.zip.001, runtime.zip.002, ...
		const partNumber = String(i + 1).padStart(3, '0');
		const partPath = path.join(outputDir, `${baseName}.zip.${partNumber}`);

		// 显示进度
		showProgress(i + 1, totalParts, `分卷进度 (${i + 1}/${totalParts})`);

		await fs.writeFile(partPath, chunk);
	}

	// 删除原始zip文件
	console.log('\n'); // 换行
	await fs.unlink(zipPath);
	console.log('分卷压缩完成！\n');
}

// 创建压缩包函数
async function createArchive() {
	try {
		// 确保输出目录存在
		await fs.ensureDir(path.dirname(runtimeConfig.output));

		// 创建输出流
		const output = fs.createWriteStream(runtimeConfig.output);
		const archive = archiver('zip', {
			zlib: { level: 9 } // 最高压缩级别
		});

		// 计算总文件数（包括目录）
		let totalFiles = 0;
		for (const folder of runtimeConfig.folders) {
			const sourcePath = path.resolve(folder.sourceDir);
			if (await fs.pathExists(sourcePath)) {
				const countEntries = async (dir) => {
					let count = 0;
					const files = await fs.readdir(dir);
					for (const file of files) {
						const filePath = path.join(dir, file);
						const stat = await fs.stat(filePath);
						if (stat.isDirectory()) {
							count++; // 计入目录
							count += await countEntries(filePath);
						} else {
							count++; // 计入文件
						}
					}
					return count;
				};
				totalFiles += await countEntries(sourcePath);
			}
		}

		// 监听压缩进度
		let processedFiles = 0;
		archive.on('entry', () => {
			processedFiles++;
			if (totalFiles > 0) {
				showProgress(
					processedFiles,
					totalFiles,
					`压缩进度 (${processedFiles}/${totalFiles})`
				);
			}
		});

		// 监听压缩完成事件
		output.on('close', async () => {
			console.log(`\n压缩完成，总大小: ${archive.pointer()} bytes`);
			// 执行分卷压缩
			await splitArchive(runtimeConfig.output, runtimeConfig.splitSizeMB);
		});

		// 监听错误事件
		archive.on('error', (err) => {
			throw err;
		});

		// 连接输出流
		archive.pipe(output);

		// 添加文件夹到压缩包
		for (const folder of runtimeConfig.folders) {
			const sourcePath = path.resolve(folder.sourceDir);
			if (await fs.pathExists(sourcePath)) {
				console.log(`正在添加: ${sourcePath}`);
				archive.directory(sourcePath, folder.zipPath);
			} else {
				console.warn(`警告: 源目录不存在: ${sourcePath}`);
			}
		}

		// 完成压缩
		await archive.finalize();
	} catch (error) {
		console.error('压缩过程中出错:', error);
		process.exit(1);
	}
}

// 执行打包
createArchive();
