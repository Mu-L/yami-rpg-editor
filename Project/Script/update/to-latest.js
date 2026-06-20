'use strict'

// 更新到最新版本(TypeScript)
Updater.updateToLatest = function (version) {
	// 从1.0.122版本开始增量替换文件
	const verNum = Updater.getVersionNumber(version)
	if (verNum >= Updater.getVersionNumber('1.0.122')) {
		return Updater.updateIncrementalChanges(version)
	}

	// 1.0.122以下版本直接覆盖全部文件
	const dstProjectDir = Path.dirname(Editor.config.project)
	const srcProjectDir = Path.resolve(__dirname, 'Templates/arpg-ts-update')
	const srcScriptDir = Path.resolve(
		__dirname,
		'Templates/arpg-ts-update/script'
	)
	const srcPluginDir = Path.resolve(
		__dirname,
		'Templates/arpg-ts-update/plugins'
	)
	const dstScriptDir = Path.resolve(dstProjectDir, 'Script')

	// 删除JS文件
	const deleteScripts = [
		'util.js',
		'file.js',
		'codec.js',
		'webgl.js',
		'audio.js',
		'printer.js',
		'variable.js',
		'animation.js',
		'data.js',
		'local.js',
		'stage.js',
		'camera.js',
		'scene.js',
		'actor.js',
		'trigger.js',
		'filter.js',
		'controller.js',
		'ui.js',
		'time.js',
		'event.js',
		'command.js',
		'main.js'
	]
	for (const fileName of deleteScripts) {
		const path = Path.resolve(dstScriptDir, fileName)
		try {
			if (FS.statSync(path).isFile()) {
				FS.unlinkSync(path)
			}
		} catch (error) {}
	}

	// 复制TS文件
	FS.cpSync(srcScriptDir, dstScriptDir, { recursive: true })

	// 替换插件文件
	const jsExtname = /\.js$/
	const guidRegExp = /(?<=\.)[0-9a-f]{16}(?=\.\w+$)/
	const files = FS.readdirSync(srcPluginDir, { withFileTypes: true })
	for (const file of files) {
		const guid = guidRegExp.exec(file.name)?.[0]
		const meta = Data.manifest.guidMap[guid]
		if (meta) {
			// 如果当前项目版本小于插件项目版本，则更新
			const sPath = Path.resolve(srcPluginDir, file.name)
			const jsPath = File.route(meta.path)
			const tsPath = File.route(meta.path.replace(jsExtname, '.ts'))
			FS.copyFileSync(sPath, jsPath)
			FS.renameSync(jsPath, tsPath)
		}
	}

	// 替换主页文件
	const sIndexPath = Path.resolve(srcProjectDir, 'index.html')
	const dIndexPath = Path.resolve(dstProjectDir, 'index.html')
	FS.copyFileSync(sIndexPath, dIndexPath)

	// 复制tsconfig文件
	const sTsconfigPath = Path.resolve(srcProjectDir, 'tsconfig.json')
	const dTsconfigPath = Path.resolve(dstProjectDir, 'tsconfig.json')
	FS.copyFileSync(sTsconfigPath, dTsconfigPath)

	// 打开更新日志窗口
	UpdateLog.open()
}
