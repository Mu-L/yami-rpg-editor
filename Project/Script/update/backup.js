'use strict'
import { Path } from '../util/config.js'
import { File } from '../file/file-system-core.js'
import { FS } from '../file/file-system.js'
import { Updater } from './updater.js'

// 备份项目
Updater.backupProject = function () {
	const projectPath = File.root
	const folderName = Path.basename(projectPath)
	const backupPath = Path.resolve(projectPath, `../${folderName}.bak`)
	FS.cpSync(projectPath, backupPath, { recursive: true })
}
