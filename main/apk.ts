import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { parseString, Builder } from 'xml2js';
import util from 'util';
import { exec } from 'child_process';
const execPromise = util.promisify(exec);
import sharp from 'sharp';
import type { ApkConfig, ApkOptions, ApkResult } from './types/apk.ts';

let isBuilding = false;
let currentChildProcess = null;
let abortController = null;

const defaultConfig = {
	apkPath: '@/app-release.apk',
	outputDir: '$/decompiled',
	newApkPath: '$/app-release-re.apk',
	apktoolPath: '@/apktool.jar',

	packageName: 'com.xuran.newapp',
	appName: 'New App Name',
	iconPath: '~/Icon/icon.png',
	versionName: '1.0.0',
	versionCode: 1,

	isSign: true,
	jksPath: '@/release.jks',
	keyStorePassword: '123456',
	keyAlias: 'xuran',
	keyPassword: '123456',
	apksignerPath: '@/apksigner.bat',
	signedApkPath: '$/app-debug-signed.apk',
	zipalignPath: '@/zipalign.exe',

	projectPath: ''
};

const ICON_SIZES = {
	'mipmap-mdpi': 48,
	'mipmap-hdpi': 72,
	'mipmap-xhdpi': 96,
	'mipmap-xxhdpi': 144,
	'mipmap-xxxhdpi': 192,
	'drawable-mdpi': 48,
	'drawable-hdpi': 72,
	'drawable-xhdpi': 96,
	'drawable-xxhdpi': 144,
	'drawable-xxxhdpi': 192
};

function fileExists(filePath: string): boolean {
	return fs.existsSync(filePath);
}

async function copyFolderAsync(source: string, destination: string): Promise<void> {
	try {
		// recursive: true 确保父目录存在
		await fsp.mkdir(destination, { recursive: true });
		const items = await fsp.readdir(source);
		// 并行处理所有文件和子目录
		await Promise.all(
			items.map(async (item) => {
				const sourcePath = path.join(source, item);
				const destPath = path.join(destination, item);

				const stats = await fsp.stat(sourcePath);

				if (stats.isDirectory()) {
					await copyFolderAsync(sourcePath, destPath);
				} else {
					await fsp.copyFile(sourcePath, destPath);
					console.log(`📄 已复制: ${item}`);
				}
			})
		);
	} catch (err) {
		console.error(`❌ 复制出错: ${(err as Error).message}`);
		throw err;
	}
}

function sendLog(msg: string, percentage: number | null = null, isError: boolean = false): void {
	if (global.editor && typeof global.editor.send === 'function') {
		global.editor.send('apk-log', {
			done: isError,
			msg: percentage !== null ? `[${percentage}%] ${msg}` : msg
		});
	}
}

async function main(options: ApkOptions = {}): Promise<ApkResult> {
	// 如果正在构建中，拒绝新的构建请求
	if (isBuilding) {
		sendLog('当前已有构建任务正在进行中', null, false);
		return false;
	}

	const { config: userConfig, onProgress, signal } = options;
	const config = { ...defaultConfig, ...userConfig };
	let currentProgress = 0;
	abortController = new AbortController();
	isBuilding = true;

	// 监听外部中止信号
	if (signal) {
		signal.addEventListener('abort', () => {
			abortBuild();
		});
	}

	try {
		sendLog('开始处理APK...');

		const requiredFiles = [
			{ path: config.apkPath, name: 'APK' },
			{ path: config.apktoolPath, name: 'apktool.jar' },
			{ path: config.iconPath, name: '图标' }
		];

		for (const file of requiredFiles) {
			if (!fileExists(file.path)) {
				sendLog(`${file.name}文件不存在: ${file.path}`, currentProgress, true);
				return false;
			}
		}

		currentProgress = 5;
		onProgress?.('文件验证通过', currentProgress);
		sendLog('文件验证通过', currentProgress);

		if (fs.existsSync(config.outputDir)) {
			await fs.promises.rm(config.outputDir, {
				recursive: true,
				force: true
			});
		}
		currentProgress += 5; // 10%
		onProgress?.('删除旧目录', currentProgress);
		sendLog('删除旧目录完成', currentProgress);

		const decompileResult = await decompileApk(config);
		if (!decompileResult.success) {
			sendLog(decompileResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 15; // 25%
		onProgress?.('反编译APK完成', currentProgress);
		sendLog('反编译APK完成', currentProgress);

		const manifestResult = await modifyManifest(config);
		if (!manifestResult.success) {
			sendLog(manifestResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 10; // 35%
		onProgress?.('修改AndroidManifest.xml完成', currentProgress);
		sendLog('修改AndroidManifest.xml完成', currentProgress);

		const stringsResult = await modifyStrings(config);
		if (!stringsResult.success) {
			sendLog(stringsResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 10; // 45%
		onProgress?.('修改应用名称完成', currentProgress);
		sendLog('修改应用名称完成', currentProgress);

		const iconsResult = await replaceIconsWithSharp(config);
		if (!iconsResult.success) {
			sendLog(iconsResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 15; // 60%
		onProgress?.('替换应用图标完成', currentProgress);
		sendLog('替换应用图标完成', currentProgress);

		const roundIconsResult = await removeRoundIcons(config);
		if (!roundIconsResult.success) {
			sendLog(roundIconsResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 5; // 65%
		onProgress?.('移除圆形图标资源完成', currentProgress);
		sendLog('移除圆形图标资源完成', currentProgress);

		const resourceResult = await fixResourceReferences(config);
		if (!resourceResult.success) {
			sendLog(resourceResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 10; // 75%
		onProgress?.('修复资源引用完成', currentProgress);
		sendLog('修复资源引用完成', currentProgress);

		try {
			await copyFolderAsync(
				path.resolve(config.projectPath, '.preview'),
				path.resolve(config.outputDir, 'assets')
			);
			onProgress?.('资源合并完成', currentProgress);
			sendLog('资源合并完成', currentProgress);
		} catch (err) {
			sendLog(`资源合并失败: ${(err as Error).message}`, currentProgress, true);
			return false;
		}

		const rebuildResult = await rebuildApk(config);
		if (!rebuildResult.success) {
			sendLog(rebuildResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 15; // 90%
		onProgress?.('重新编译APK完成', currentProgress);
		sendLog('重新编译APK完成', currentProgress);

		const zipalignResult = await zipalignApk(config);
		if (!zipalignResult.success) {
			sendLog(zipalignResult.error, currentProgress, true);
			return false;
		}
		currentProgress += 5; // 95%
		onProgress?.('APK对齐处理完成', currentProgress);
		sendLog('APK对齐处理完成', currentProgress);

		if (config.isSign) {
			const signResult = await signApk(config);
			if (!signResult.success) {
				sendLog(signResult.error, currentProgress, true);
				return false;
			}
		}
		currentProgress = 100;
		onProgress?.('APK处理完成', currentProgress);
		sendLog('APK处理完成', currentProgress);

		sendLog(`✅ APK修改完成! 新文件: ${config.signedApkPath}\n可以直接安装到设备`);
		return true;
	} catch (err) {
		onProgress?.('处理失败: ' + (err as Error).message, currentProgress);
		sendLog(`处理失败: ${(err as Error).message}`, currentProgress, true);
		return false;
	} finally {
		isBuilding = false;
	}
}

async function decompileApk(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	const cmd = `java -jar "${config.apktoolPath}" d "${config.apkPath}" -o "${config.outputDir}" -f --only-main-classes`;

	return new Promise((resolve) => {
		const child = exec(cmd, (error, stdout, stderr) => {
			currentChildProcess = null;
			if (error) {
				resolve({
					success: false,
					error: `反编译失败: ${(error as Error & { stderr?: string }).stderr || (error as Error).message}`
				});
			} else {
				resolve({ success: true });
			}
		});

		currentChildProcess = child;

		// 监听中止信号
		abortController.signal.addEventListener('abort', () => {
			if (child) {
				child.kill('SIGINT');
				resolve({
					success: false,
					error: '构建已被用户中断'
				});
			}
		});
	});
}

async function modifyManifest(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	const manifestPath = path.join(config.outputDir, 'AndroidManifest.xml');

	try {
		let xml = await fs.promises.readFile(manifestPath, 'utf8');

		// 直接通过字符串替换删除roundIcon属性（XML解析器可能漏掉）
		xml = xml.replace(/android:roundIcon="[^"]*"/g, '');

		const result = await parseXml(xml);
		result.manifest.$.package = config.packageName;

		if (config.versionName) {
			result.manifest.$['android:versionName'] = config.versionName;
		}
		if (config.versionCode !== undefined) {
			result.manifest.$['android:versionCode'] = config.versionCode.toString();
		}
		// 确保application标签中只保留正确的icon引用和设置应用名称
		if (result.manifest.application) {
			const app = Array.isArray(result.manifest.application)
				? result.manifest.application[0]
				: result.manifest.application;
			app.$.icon = '@mipmap/ic_launcher';
			app.$['android:label'] = '@string/app_name'; // 确保使用字符串资源中的名称
			delete app.$.roundIcon;

			// 删除任何硬编码的应用名称
			if (app.$['android:label'] && app.$['android:label'].startsWith('"')) {
				app.$['android:label'] = '@string/app_name';
			}
		}

		const builder = new Builder({ headless: true });
		const newXml = builder.buildObject(result);
		await fs.promises.writeFile(manifestPath, newXml);

		const modifiedXml = await fs.promises.readFile(manifestPath, 'utf8');

		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: `修改AndroidManifest.xml失败: ${(err as Error).message}`
		};
	}
}

async function modifyStrings(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	const resDir = path.join(config.outputDir, 'res');

	try {
		const valuesDirs = await fs.promises.readdir(resDir, {
			withFileTypes: true
		});

		for (const dirent of valuesDirs) {
			if (dirent.isDirectory() && dirent.name.startsWith('values')) {
				const stringsPath = path.join(resDir, dirent.name, 'strings.xml');

				if (fileExists(stringsPath)) {
					await updateStringsFile(stringsPath, config);
				}
			}
		}

		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: `修改strings.xml失败: ${(err as Error).message}`
		};
	}
}

async function updateStringsFile(stringsPath: string, config: ApkConfig): Promise<void> {
	try {
		const xml = await fs.promises.readFile(stringsPath, 'utf8');
		const result = await parseXml(xml);

		const resources = result.resources;
		let found = false;

		if (resources.string) {
			resources.string.forEach((item) => {
				if (item.$.name === 'app_name') {
					item._ = config.appName;
					found = true;
				} else if (item.$.name === 'title_activity_yami') {
					item._ = config.appName;
				}
			});
		}

		// 如果没有找到app_name，创建一个
		if (!found) {
			if (!resources.string) resources.string = [];
			resources.string.push({
				$: { name: 'app_name' },
				_: config.appName
			});
		}

		const builder = new Builder();
		const newXml = builder.buildObject(result);
		await fs.promises.writeFile(stringsPath, newXml);
	} catch (err) {
		throw err;
	}
}

async function replaceIconsWithSharp(
	config: ApkConfig
): Promise<{ success: boolean; error?: string }> {
	console.log('使用sharp处理并替换应用图标...');

	try {
		const resDir = path.join(config.outputDir, 'res');
		if (!fs.existsSync(resDir)) {
			throw new Error('资源目录res不存在，可能反编译失败');
		}

		if (!fileExists(config.iconPath)) {
			throw new Error(`源图标文件不存在: ${config.iconPath}`);
		}

		let sourceImage;
		try {
			sourceImage = sharp(config.iconPath);
			const metadata = await sourceImage.metadata();
			if (!metadata.width || !metadata.height) {
				throw new Error('无法读取图标尺寸');
			}
		} catch (err) {
			throw new Error(`源图标文件无效: ${(err as Error).message}`);
		}

		const iconDirs = Object.keys(ICON_SIZES)
			.map((dir) => path.join(resDir, dir))
			.filter((dir) => fs.existsSync(dir) && !dir.includes('anydpi'));

		if (iconDirs.length === 0) {
			throw new Error('未找到任何图标目录（mipmap/drawable），无法替换图标');
		}
		console.log(`找到图标目录: ${iconDirs.join(', ')}`);

		for (const dirPath of iconDirs) {
			const dirName = path.basename(dirPath);
			const targetSize = ICON_SIZES[dirName] || 192;

			const files = await fs.promises.readdir(dirPath);
			for (const file of files) {
				if (file.startsWith('ic_launcher')) {
					const filePath = path.join(dirPath, file);
					await fs.promises.unlink(filePath);
				}
			}

			const destPath = path.join(dirPath, 'ic_launcher.png');

			await sourceImage
				.resize(targetSize, targetSize, {
					fit: 'contain',
					background: { r: 0, g: 0, b: 0, alpha: 0 }
				})
				.toFile(destPath);
		}

		await removeAdaptiveIconConfigs(config);

		console.log('所有图标目录处理完成');
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: `替换图标失败: ${(err as Error).message}`
		};
	}
}

async function removeAdaptiveIconConfigs(config: ApkConfig): Promise<void> {
	const resDir = path.join(config.outputDir, 'res');

	const dirs = await fs.promises.readdir(resDir);
	for (const dir of dirs) {
		if (dir.includes('anydpi')) {
			const anydpiPath = path.join(resDir, dir);

			const files = await fs.promises.readdir(anydpiPath);
			for (const file of files) {
				if (file === 'ic_launcher.xml' || file === 'ic_launcher_round.xml') {
					const filePath = path.join(anydpiPath, file);
					await fs.promises.unlink(filePath);
				}
			}
		}
	}
}

async function removeRoundIcons(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	try {
		const resDir = path.join(config.outputDir, 'res');
		const resDirs = await fs.promises.readdir(resDir);

		for (const dir of resDirs) {
			const dirPath = path.join(resDir, dir);

			if (dir.startsWith('drawable') || dir.startsWith('mipmap')) {
				if (!fs.existsSync(dirPath)) continue;

				const files = await fs.promises.readdir(dirPath);

				for (const file of files) {
					if (file.includes('_round')) {
						await fs.promises.unlink(path.join(dirPath, file));
						console.log(`已删除圆形图标: ${path.join(dirPath, file)}`);
					}
				}
			}
		}

		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: `移除圆形图标失败: ${(err as Error).message}`
		};
	}
}

async function fixResourceReferences(
	config: ApkConfig
): Promise<{ success: boolean; error?: string }> {
	try {
		const publicXmlPath = path.join(config.outputDir, 'res', 'values', 'public.xml');
		if (fs.existsSync(publicXmlPath)) {
			await cleanPublicXml(publicXmlPath);
		}

		const stylesPath = path.join(config.outputDir, 'res', 'values', 'styles.xml');
		if (fs.existsSync(stylesPath)) {
			console.log('检查 styles.xml 中的圆形图标引用...');
			await cleanStylesXml(stylesPath);
		}

		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: `修复资源引用失败: ${(err as Error).message}`
		};
	}
}

async function cleanStylesXml(stylesPath: string): Promise<void> {
	const xml = await fs.promises.readFile(stylesPath, 'utf8');
	const result = await parseXml(xml);

	if (result.resources && result.resources.style) {
		result.resources.style.forEach((style) => {
			if (style.$ && style.$.name === 'AppTheme') {
				if (style.item) {
					style.item = style.item.filter((item) => {
						return !(
							item.$.name === 'android:roundIcon' &&
							item._ === '@mipmap/ic_launcher_round'
						);
					});
				}
			}
		});
	}

	const builder = new Builder();
	const newXml = builder.buildObject(result);
	await fs.promises.writeFile(stylesPath, newXml);
}

async function cleanPublicXml(publicXmlPath: string): Promise<void> {
	const xml = await fs.promises.readFile(publicXmlPath, 'utf8');
	const result = await parseXml(xml);

	if (result.resources && result.resources.public) {
		result.resources.public = result.resources.public.filter((item) => {
			const name = item.$.name;
			const type = item.$.type;

			// 只保留ic_launcher的资源映射，删除其他 launcher 相关资源
			if (name === 'ic_launcher' && (type === 'mipmap' || type === 'drawable')) {
				return true;
			}
			return !(name.includes('ic_launcher') && (type === 'mipmap' || type === 'drawable'));
		});
	}

	const builder = new Builder();
	const newXml = builder.buildObject(result);
	await fs.promises.writeFile(publicXmlPath, newXml);
}

async function rebuildApk(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	console.log('重新编译APK...');
	const cmd = `java -jar "${config.apktoolPath}" b "${config.outputDir}" -o "${config.newApkPath}"`;

	try {
		const { stdout, stderr } = await execPromise(cmd);

		if (stderr && (stderr.includes('W:') || stderr.includes('error:'))) {
			// 非致命警告不中断构建
			if (
				!stderr.includes('failed linking references') &&
				!stderr.includes('Exception in thread "main"')
			) {
				console.log('重新编译成功（有警告）');
				return { success: true };
			}

			return {
				success: false,
				error: `重新编译失败: ${stderr}`
			};
		}

		return { success: true };
	} catch (error) {
		const errorMsg =
			`重新编译失败: ${(error as Error & { stderr?: string }).stderr || (error as Error).message}\n` +
			`可能原因:\n` +
			`1. 资源冲突(如图标格式不统一)\n` +
			`2. AndroidManifest.xml格式错误\n` +
			`3. 缺少依赖框架\n` +
			`4. public.xml 中的资源引用问题\n` +
			`建议: 检查反编译目录中的错误日志`;
		return {
			success: false,
			error: errorMsg
		};
	}
}

async function zipalignApk(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	console.log('执行zipalign对齐处理...');

	if (!fileExists(config.zipalignPath)) {
		return {
			success: false,
			error: `zipalign工具不存在: ${config.zipalignPath}`
		};
	}

	const alignedTempPath = `${config.newApkPath}.aligned`;

	// -f 强制覆盖；4 按4字节对齐
	const cmd = `"${config.zipalignPath}" -f 4 "${config.newApkPath}" "${alignedTempPath}"`;

	try {
		const { stdout, stderr } = await execPromise(cmd);

		await fs.promises.unlink(config.newApkPath);
		await fs.promises.rename(alignedTempPath, config.newApkPath);

		console.log('✅ zipalign对齐处理完成');
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: `zipalign处理失败: ${(error as Error & { stderr?: string }).stderr || (error as Error).message}`
		};
	}
}

async function signApk(config: ApkConfig): Promise<{ success: boolean; error?: string }> {
	const signCmd = `${config.apksignerPath} sign --ks "${config.jksPath}" --ks-pass pass:"${config.keyStorePassword}" --key-pass pass:"${config.keyPassword}" --ks-key-alias ${config.keyAlias} --out "${config.signedApkPath}" "${config.newApkPath}"`;

	const jarsignerCmd = `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${config.jksPath}" -storepass "${config.keyStorePassword}" -keypass "${config.keyPassword}" "${config.newApkPath}" ${config.keyAlias}`;

	try {
		const { stdout, stderr } = await execPromise(signCmd);
	} catch (apksignerError) {
		try {
			console.log(`执行命令: ${jarsignerCmd}`);
			const { stdout, stderr } = await execPromise(jarsignerCmd);

			await fs.promises.rename(config.newApkPath, config.signedApkPath);
		} catch (jarsignerError) {
			return {
				success: false,
				error: `签名失败:\nAPKSigner错误: ${
					(apksignerError as Error & { stderr?: string }).stderr ||
					(apksignerError as Error).message
				}\nJarSigner错误: ${(jarsignerError as Error & { stderr?: string }).stderr || (jarsignerError as Error).message}`
			};
		}
	}

	// 验证签名
	await verifySignature(config);
	return { success: true };
}

async function verifySignature(config: ApkConfig): Promise<void> {
	console.log('验证APK签名...');

	try {
		const verifyCmd = `${config.apksignerPath} verify -v "${config.signedApkPath}"`;
		const { stdout, stderr } = await execPromise(verifyCmd);

		if (stdout.includes('Verified')) {
			console.log('✅ APK签名验证成功');
		} else {
			console.warn('⚠️ APK签名验证结果不确定');
		}
	} catch (error) {
		console.warn('无法验证签名:', (error as Error).message);
	}
}

function parseXml(xml: string): Promise<any> {
	return new Promise((resolve, reject) => {
		parseString(xml, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
}

function abortBuild(): boolean {
	if (!isBuilding) return false;

	abortController?.abort();

	if (currentChildProcess) {
		currentChildProcess.kill('SIGINT');
		currentChildProcess = null;
	}

	isBuilding = false;
	return true;
}

function isBuildingStatus(): boolean {
	return isBuilding;
}

export {
	main,
	abortBuild,
	isBuildingStatus as isBuilding,
	decompileApk,
	modifyManifest,
	modifyStrings,
	replaceIconsWithSharp,
	removeRoundIcons,
	fixResourceReferences,
	rebuildApk,
	signApk,
	verifySignature,
	parseXml
};
