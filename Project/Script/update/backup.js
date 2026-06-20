'use strict'

// 备份项目
Updater.backupProject = function () {
	const projectPath = File.root
	const folderName = Path.basename(projectPath)
	const backupPath = Path.resolve(projectPath, `../${folderName}.bak`)
	FS.cpSync(projectPath, backupPath, { recursive: true })
}
