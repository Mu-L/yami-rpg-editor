const require = window.__nodeRequire || window.require
;('use strict')
import { Path } from '../util/config.js'
import { Animation } from '../animation/animation-window.js'
import { Data } from '../data/data-object.js'
import { Project } from '../data/project-settings-window.js'
import { File } from '../file/file-system-core.js'
import { FS } from '../file/file-system.js'
import { Reference } from '../log/related-references.js'
import { UpdateLog } from '../log/update-log-window.js'
import { Editor } from '../main/editor.js'
import { Particle } from '../particle/particle-window.js'
import { Light } from '../scene/light.js'
import { Parallax } from '../scene/parallax.js'
import { UI } from '../ui/ui-window.js'
import { Updater } from './updater.js'
import { Texture } from '../webgl/texture.js'
// ESM 下 __dirname 不存在，用 import.meta.url 推算：file: 协议剥两次得 dist/，http/https 兜底 process.cwd()/Project
const { fileURLToPath, URL } = require('url')
const _moduleURL = new URL(import.meta.url)
const _modulePath =
	_moduleURL.protocol === 'file:'
		? fileURLToPath(_moduleURL)
		: Path.resolve(
				process.cwd(),
				'Project',
				_moduleURL.pathname.split('/').pop()
			)
const __dirname =
	_moduleURL.protocol === 'file:'
		? Path.dirname(Path.dirname(_modulePath)) // dist/assets/x.js → dist/
		: Path.resolve(process.cwd(), 'Project')

// 更新增量改动
Updater.updateIncrementalChanges = function (version) {
	const verNum = Updater.getVersionNumber(version)
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
	const bakFolderDir = Path.resolve(dstProjectDir, `${version}.bak`)
	const messages = []
	const copyedFiles = {}
	let isBackupFolderCreated = false

	// 更新程序集合
	const updater = new (class VersionUpdater {
		showMessage() {
			if (messages.length !== 0) {
				UpdateLog.open(messages)
			}
		}

		logVersion(version) {
			messages.push({ title: `Update ${version}` })
		}

		logMessage(...contents) {
			messages.push({ major: contents.join('\n') })
		}

		logReplace(dstPath) {
			const path = Path.relative(dstProjectDir, dstPath)
			const message = `write: ${path}`
			messages.push({ minor: this.capitalize(message) })
			console.log(message)
		}

		capitalize(message) {
			return message.charAt(0).toUpperCase() + message.slice(1)
		}

		makeBakupFolder() {
			if (!isBackupFolderCreated) {
				isBackupFolderCreated = true
				FS.mkdirSync(bakFolderDir, { recursive: true })
				const folderName = Path.basename(bakFolderDir)
				const message = `backup: ${folderName}`
				messages.push({ minor: this.capitalize(message) })
				console.log(message)
			}
		}

		// 复制文件
		copyFile(srcPath, dstPath) {
			if (copyedFiles[dstPath]) {
				return
			}
			copyedFiles[dstPath] = true
			try {
				if (FS.statSync(dstPath).isFile()) {
					this.makeBakupFolder()
					const dstName = Path.basename(dstPath)
					const bakPath = Path.resolve(bakFolderDir, dstName)
					FS.copyFileSync(dstPath, bakPath)
					FS.copyFileSync(srcPath, dstPath)
					this.logReplace(dstPath)
				}
			} catch (error) {
				console.error(error)
			}
		}

		// 复制文件
		copyFiles(...fileNames) {
			for (const fileName of fileNames) {
				const srcFilePath = Path.resolve(srcProjectDir, fileName)
				const dstFilePath = Path.resolve(dstProjectDir, fileName)
				this.copyFile(srcFilePath, dstFilePath)
			}
		}

		// 复制脚本文件
		copyScripts(...fileNames) {
			for (const fileName of fileNames) {
				const srcScriptPath = Path.resolve(srcScriptDir, fileName)
				const dstScriptPath = Path.resolve(dstScriptDir, fileName)
				this.copyFile(srcScriptPath, dstScriptPath)
			}
		}

		// 复制插件文件
		copyPlugins(...filters) {
			const guidRegExp = /(?<=\.)[0-9a-f]{16}(?=\.\w+$)/
			const files = FS.readdirSync(srcPluginDir, { withFileTypes: true })
			for (const file of files) {
				const guid = guidRegExp.exec(file.name)?.[0]
				if (filters.length === 0 || filters.includes(guid)) {
					const meta = Data.manifest.guidMap[guid]
					if (meta) {
						// 如果当前项目版本小于插件项目版本，则更新
						const sPath = Path.resolve(srcPluginDir, file.name)
						const dPath = File.path(meta.path)
						this.copyFile(sPath, dPath)
					}
				}
			}
		}

		'1.0.122'() {
			this.logMessage(
				'Rewrite the game script in TypeScript and replace all built-in script and plugin files.'
			)
		}

		'1.0.123'(update) {
			this.logMessage(
				'Fix the bug where the scene terrain was not applied.'
			)
			if (!update) return
			this.copyScripts('scene.ts', 'actor.ts')
		}

		'1.0.124'(update) {
			this.logMessage('Add some event types to the global event script.')
			if (!update) return
			this.copyScripts('event.ts', 'yami/yami.script.d.ts')
		}

		'1.0.125'(update) {
			this.logMessage(
				'Fix a bug where a "touch event" was not mapped to a "mouse event".'
			)
			if (!update) return
			this.copyScripts('util.ts', 'input.ts')
		}

		'1.0.126'(update) {
			this.logMessage(
				'Fix the incorrect behavior of the "mouse leave element" event in a special case.'
			)
			if (!update) return
			this.copyScripts('ui.ts')
		}

		'1.0.127'(update) {
			this.logMessage(
				'Prioritize the loading order of plugin scripts.',
				'Add project settings options: Preload, Texture Sampling Mode.',
				'Add touch events to the global event script.',
				'Fix the bug where two immovable circular actors may move when they collide.'
			)
			if (!update) return
			this.copyScripts(
				'actor.ts',
				'audio.ts',
				'input.ts',
				'loader.ts',
				'animation.ts',
				'event.ts',
				'util.ts',
				'main.ts',
				'stage.ts',
				'printer.ts',
				'data.ts',
				'command.ts',
				'scene.ts',
				'webgl.ts',
				'yami/yami.data.d.ts',
				'yami/yami.actor.d.ts',
				'yami/yami.event.d.ts',
				'yami/yami.script.d.ts',
				'yami/yami.webgl.d.ts'
			)
			this.copyPlugins(
				'78ad4052c278d184',
				'ad08a4def6200207',
				'bc72195fc998f0af'
			)
		}

		'1.0.128'(update) {
			this.logMessage('Secret!')
			if (!update) return
			this.copyScripts(
				'audio.ts',
				'loader.ts',
				'data.ts',
				'yami/yami.data.d.ts'
			)
		}

		'1.0.129'(update) {
			this.logMessage(
				'The objects read in the event will undergo a validity check, and destroyed objects will no longer be retrieved.',
				'Add "destroyed" property to element objects in code.'
			)
			if (!update) return
			this.copyScripts('ui.ts', 'command.ts')
		}

		'1.0.130'(update) {
			this.logMessage(
				'Extends the "Block" command with a new asynchronous execution option.',
				'A warning is issued to the user for "Independent" commands running in the background for over 1 minute.',
				'Delayed the camera update timing within the current frame, allowing it to lock onto the target more quickly.',
				'Optimized the tilemap loading process. When preloading images, loading is no longer required, enabling seamless map transitions.'
			)
			if (!update) return
			this.copyFiles('tsconfig.json')
			this.copyScripts(
				'scene.ts',
				'camera.ts',
				'animation.ts',
				'event.ts',
				'command.ts',
				'main.ts'
			)
		}

		'1.0.131'(update) {
			this.logMessage(
				'Fixed the bug where touch events on UI elements were incorrectly triggered.',
				'Fixed the bug where immovable actors could still be pushed.',
				'Fixed the bug where the dialog plugin could still be triggered while the game was paused.',
				'Added the camera update function to the update loop to ensure object positions can be retrieved accurately during element events.'
			)
			if (!update) return
			this.copyScripts(
				'main.ts',
				'camera.ts',
				'actor.ts',
				'input.ts',
				'ui.ts',
				'event.ts',
				'webgl.ts'
			)
			this.copyPlugins('aa20eb36e72e9e90')
		}

		'1.0.134'(update) {
			this.logMessage(
				'Fixed a bug in the pathfinding system where partial paths around obstacles were calculated incorrectly.',
				'Fixed a bug where calling Flow.waitRaw could cause inaccurate timing in Flow.wait and Flow.transition.',
				'Updated the Russian language pack.'
			)
			if (!update) return
			this.copyScripts(
				'scene.ts',
				'event.ts',
				'flow.ts',
				'time.ts',
				'util.ts'
			)
		}

		'1.0.135'(update) {
			this.logMessage(
				'Strictly limit the number of trigger hits to prevent exceeding the allowed count when multiple targets are hit simultaneously.',
				'Removed some redundant code and corrected several incorrect comment names.'
			)
			if (!update) return
			this.copyScripts(
				'scene.ts',
				'trigger.ts',
				'command.ts',
				'ui.ts',
				'util.ts',
				'yami/yami.command.d.ts',
				'yami/yami.webgl.d.ts'
			)
		}

		'1.0.136'(update) {
			this.logMessage(
				'Removed the Steam online verification feature, allowing the editor to be opened directly without launching Steam.',
				'Add a "Find in Project" menu item for applicable scene objects (Actor, Animation, Particle, Parallax).',
				'Upgraded the "Trigger_PointLight.ts" script by adding a "Direct Light Ratio" property to enhance the lighting effect.'
			)
			if (!update) return
			this.copyPlugins('4acd97b2c159796f')
		}

		'1.0.137'(update) {
			this.logMessage(
				'Fixed a bug caused by version 1.0.131 where files were not automatically saved when closing the editor.',
				'Fixed the trigger malfunction caused by version 1.0.135.'
			)
			if (!update) return
			this.copyScripts('trigger.ts')
		}

		'1.0.139'(update) {
			this.logMessage(
				'Fixed a bug where the application would forcibly exit after a 2-second timeout if no action was taken on the save prompt at exit.',
				'Fixed a bug where UI animation elements with opacity less than 1 did not affect particles.',
				'Fixed a bug where executing a "Break" command inside nested "For Each" loops caused incorrect execution flow.',
				'Fixed a bug where enabling the "Sync Angle" option in the "Add Animation Component" command did not immediately refresh the angle when first added.',
				"Fixed a bug where the collision function was not disabled when an actor's weight was 0.",
				'For practical reasons, enabling "Async" in the "Block" command no longer ties the block\'s lifecycle to the event. Asynchronous blocks now continue running after the event, and users must manage their lifecycle manually.',
				'Added a setting for animation particle layers: "Order", allowing particles to be drawn below or above the sprite.',
				"Added a GitHub submenu under the editor's Help menu linking to the open-source projects."
			)
			if (!update) return
			this.copyScripts(
				'actor.ts',
				'animation.ts',
				'command.ts',
				'yami/yami.actor.d.ts',
				'yami/yami.animation.d.ts',
				'yami/yami.command.d.ts'
			)
			Updater.updateAnimations()
		}

		'1.0.140'(update) {
			this.logMessage(
				'Fixed a bug where accessing a light source object through a variable in an event command caused an error.'
			)
			if (!update) return
			this.copyScripts('command.ts')
		}

		'1.0.145'(update) {
			this.logMessage(
				'Fixed a bug where entering conditional branches in the synchronous "Block" command caused an error.',
				'Improved the implementation of "For Each" command to make it more reliable during jumps and exits.'
			)
			if (!update) return
			this.copyScripts(
				'ui.ts',
				'event.ts',
				'command.ts',
				'yami/yami.command.d.ts'
			)
		}

		'1.0.146'(update) {
			this.logMessage(
				'Fixed a bug where using numeric variables in the "Discard Targets" command had no effect.',
				'Fixed a bug where the "Reference Element" was still created even when disabled.',
				"Fixed a bug that could cause an error when saving the game if one actor referenced another actor's inventory.",
				'Improved the "Set Button" command so that when setting the tint, it automatically switches to the corresponding "Effect" option.',
				'Improved collision handling — when two colliding actors are created in the same position, they now automatically separate.',
				'Added joystick dead zone and magnitude properties to the Controller object, with a default dead zone radius of 50%.',
				'Removed appearance conditions for several actors in the new project scene.',
				'Extracted the logic of the "New Game" button from the new project title screen and moved it to an event file.',
				'Updated the Russian language packs for the editor and plugins, and included them in the new project.'
			)
			if (!update) return
			this.copyScripts(
				'actor.ts',
				'audio.ts',
				'command.ts',
				'event.ts',
				'input.ts',
				'ui.ts',
				'yami/yami.input.d.ts',
				'yami/yami.ui.d.ts'
			)
		}

		'1.0.147'(update) {
			this.logMessage(
				'Improved the English and Simplified Chinese language packs.',
				'Added the Traditional Chinese language pack.',
				'Added the tilemap\'s "getTile" method.',
				'Improved the tilemap\'s "setTile" method so that setting a tile now updates surrounding autotiles.'
			)
			if (!update) return
			this.copyScripts(
				'scene.ts',
				'time.ts',
				'ui.ts',
				'yami/yami.scene.d.ts'
			)
		}
	})()

	const verLatest = Updater.getVersionNumber(Updater.latestProjectVersion)
	const currentMinorVer = verNum % 10000
	const latestMinorVer = verLatest % 10000
	const initialMinorVer = 122
	for (
		let minorVer = latestMinorVer;
		minorVer >= initialMinorVer;
		minorVer--
	) {
		const version = `1.0.${minorVer}`
		const handler = updater[version]
		if (handler) {
			updater.logVersion(version)
			handler.call(updater, currentMinorVer < minorVer)
		}
	}
	updater.showMessage()
}

const path = require('path')
