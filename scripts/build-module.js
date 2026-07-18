const fs = require('fs')
const path = require('path')

const projectDir = path.resolve(__dirname, '..', 'Project')
const headFile = path.join(projectDir, 'html', 'head.html')
const initOut = path.join(projectDir, 'Script', 'main', 'module-init.js')

const head = fs.readFileSync(headFile, 'utf-8')
const scriptMatches = [...head.matchAll(/src="(Script\/[^"]+)"/g)]
const scriptPaths = scriptMatches.map((m) => m[1])
const userScripts = scriptPaths.filter((p) => !p.startsWith('Script/vs/'))

// 已由真 ESM 改造、显式 import/export 的文件，跳过全局绑定注入
const realEsmExclude = new Set([
	'Script/animation/animation-player.js',
	'Script/animation/animation-window.js',
	'Script/animation/curve-window.js',
	'Script/attribute/attribute-context.js',
	'Script/attribute/attribute-window.js',
	'Script/audio/audio-manager.js',
	'Script/audio/audio-player.js',
	'Script/audio/multiple-audio-player.js',
	'Script/audio/reverb.js',
	'Script/browser/project-browser.js',
	'Script/browser/resource-selector.js',
	'Script/codec/codec.js',
	'Script/command/actor-accessor-window.js',
	'Script/command/ancestor-accessor-window.js',
	'Script/command/angle-accessor-window.js',
	'Script/command/command-color.js',
	'Script/command/command-custom.js',
	'Script/command/command-object.js',
	'Script/command/command-parse.js',
	'Script/command/command-tip.js',
	'Script/command/command-util.js',
	'Script/command/conditional-branch-window.js',
	'Script/command/conditional-condition-window.js',
	'Script/command/custom-command-window.js',
	'Script/command/element-accessor-window.js',
	'Script/command/equipment-accessor-window.js',
	'Script/command/event-editor.js',
	'Script/command/item-accessor-window.js',
	'Script/command/light-accessor-window.js',
	'Script/command/mark-string-manager.js',
	'Script/command/match-branch-window.js',
	'Script/command/match-condition-window.js',
	'Script/command/move-element-property-window.js',
	'Script/command/move-light-property-window.js',
	'Script/command/position-accessor-window.js',
	'Script/command/property-window-factory.js',
	'Script/command/region-accessor-window.js',
	'Script/command/scene-object-accessor-window.js',
	'Script/command/set-animation-property-window.js',
	'Script/command/set-button-property-window.js',
	'Script/command/set-dialog-property-window.js',
	'Script/command/set-image-property-window.js',
	'Script/command/set-progress-property-window.js',
	'Script/command/set-text-property-window.js',
	'Script/command/set-textbox-property-window.js',
	'Script/command/set-value-operand-window.js',
	'Script/command/set-video-property-window.js',
	'Script/command/set-window-property-window.js',
	'Script/command/show-options-window.js',
	'Script/command/skill-accessor-window.js',
	'Script/command/state-accessor-window.js',
	'Script/command/text-tip.js',
	'Script/command/tilemap-accessor-window.js',
	'Script/command/trigger-accessor-window.js',
	'Script/command/variable-accessor-window.js',
	'Script/components/check-box.js',
	'Script/components/color-box.js',
	'Script/components/command-history.js',
	'Script/components/command-list.js',
	'Script/components/common-list.js',
	'Script/components/custom-box.js',
	'Script/components/detail-box.js',
	'Script/components/detail-summary.js',
	'Script/components/drag-and-drop-hint.js',
	'Script/components/element-methods.js',
	'Script/components/empty-state.js',
	'Script/components/file-body-pane.js',
	'Script/components/file-browser.js',
	'Script/components/file-head-pane.js',
	'Script/components/file-nav-pane.js',
	'Script/components/file-var.js',
	'Script/components/filter-box.js',
	'Script/components/gamepad-box.js',
	'Script/components/history-timer.js',
	'Script/components/keyboard-box.js',
	'Script/components/loading-overlay.js',
	'Script/components/marquee-area.js',
	'Script/components/menu-list.js',
	'Script/components/nav-bar.js',
	'Script/components/number-box.js',
	'Script/components/number-history.js',
	'Script/components/number-var.js',
	'Script/components/page-manager.js',
	'Script/components/param-history.js',
	'Script/components/param-list.js',
	'Script/components/parameter-pane.js',
	'Script/components/radio-box.js',
	'Script/components/radio-proxy.js',
	'Script/components/scroll-bar.js',
	'Script/components/scroll-listener.js',
	'Script/components/select-box.js',
	'Script/components/select-list.js',
	'Script/components/select-var.js',
	'Script/components/slider-box.js',
	'Script/components/string-var.js',
	'Script/components/switch-item.js',
	'Script/components/tab-bar.js',
	'Script/components/text-area.js',
	'Script/components/text-box.js',
	'Script/components/text-history.js',
	'Script/components/textarea-var.js',
	'Script/components/title-bar.js',
	'Script/components/toast.js',
	'Script/components/tree-data-context.js',
	'Script/components/tree-list.js',
	'Script/components/type-registry.js',
	'Script/components/window-frame.js',
	'Script/data/data-object.js',
	'Script/data/metadata-manifest.js',
	'Script/data/metadata.js',
	'Script/data/project-settings-window.js',
	'Script/data/team-window.js',
	'Script/data/transition-window.js',
	'Script/enum/enum-context.js',
	'Script/enum/enum-window.js',
	'Script/file/directory-object.js',
	'Script/file/file-item.js',
	'Script/file/file-system-core.js',
	'Script/file/file-system.js',
	'Script/file/folder-item.js',
	'Script/file/guid.js',
	'Script/file/path-utils.js',
	'Script/inspector/animation-action-page.js',
	'Script/inspector/animation-bone-frame-page.js',
	'Script/inspector/animation-bone-layer-page.js',
	'Script/inspector/animation-particle-frame-page.js',
	'Script/inspector/animation-particle-layer-page.js',
	'Script/inspector/animation-sound-frame-page.js',
	'Script/inspector/animation-sound-layer-page.js',
	'Script/inspector/animation-sprite-frame-page.js',
	'Script/inspector/animation-sprite-layer-page.js',
	'Script/inspector/element-animation-page.js',
	'Script/inspector/element-button-page.js',
	'Script/inspector/element-container-page.js',
	'Script/inspector/element-dialog-page.js',
	'Script/inspector/element-image-page.js',
	'Script/inspector/element-page.js',
	'Script/inspector/element-progress-page.js',
	'Script/inspector/element-reference-page.js',
	'Script/inspector/element-text-page.js',
	'Script/inspector/element-textbox-page.js',
	'Script/inspector/element-video-page.js',
	'Script/inspector/element-window-page.js',
	'Script/inspector/file-actor-page.js',
	'Script/inspector/file-animation-page.js',
	'Script/inspector/file-audio-page.js',
	'Script/inspector/file-equipment-page.js',
	'Script/inspector/file-event-page.js',
	'Script/inspector/file-font-page.js',
	'Script/inspector/file-image-page.js',
	'Script/inspector/file-item-page.js',
	'Script/inspector/file-particle-page.js',
	'Script/inspector/file-scene-page.js',
	'Script/inspector/file-script-page.js',
	'Script/inspector/file-skill-page.js',
	'Script/inspector/file-state-page.js',
	'Script/inspector/file-tileset-page.js',
	'Script/inspector/file-trigger-page.js',
	'Script/inspector/file-ui-page.js',
	'Script/inspector/file-video-page.js',
	'Script/inspector/inspector.js',
	'Script/inspector/particle-layer-page.js',
	'Script/inspector/scene-actor-page.js',
	'Script/inspector/scene-animation-page.js',
	'Script/inspector/scene-light-page.js',
	'Script/inspector/scene-parallax-page.js',
	'Script/inspector/scene-particle-page.js',
	'Script/inspector/scene-region-page.js',
	'Script/inspector/scene-tilemap-page.js',
	'Script/layout/layout.js',
	'Script/local/export-language-window.js',
	'Script/local/import-language-window.js',
	'Script/local/local-object.js',
	'Script/local/local-window.js',
	'Script/log/log-window.js',
	'Script/log/related-references.js',
	'Script/log/update-log-window.js',
	'Script/main/close.js',
	'Script/main/config.js',
	'Script/main/editor.js',
	'Script/main/hotkey.js',
	'Script/main/initialize.js',
	'Script/main/main.js',
	'Script/main/module-init.js',
	'Script/main/open.js',
	'Script/main/path.js',
	'Script/main/project.js',
	'Script/main/version.js',
	'Script/module/apkbuilder.js',
	'Script/module/browserSearchHistory.js',
	'Script/module/command/activateScene.js',
	'Script/module/command/addAnimationComponent.js',
	'Script/module/command/appendTarget.js',
	'Script/module/command/block.js',
	'Script/module/command/break.js',
	'Script/module/command/callEvent.js',
	'Script/module/command/castSkill.js',
	'Script/module/command/changeActorAnimation.js',
	'Script/module/command/changeActorEquipment.js',
	'Script/module/command/changeActorMotion.js',
	'Script/module/command/changeActorPortrait.js',
	'Script/module/command/changeActorSkill.js',
	'Script/module/command/changeActorSprite.js',
	'Script/module/command/changeActorState.js',
	'Script/module/command/changeActorTeam.js',
	'Script/module/command/changePassableTerrain.js',
	'Script/module/command/changeThreat.js',
	'Script/module/command/clampCamera.js',
	'Script/module/command/commandLine.js',
	'Script/module/command/comment.js',
	'Script/module/command/continue.js',
	'Script/module/command/continueGame.js',
	'Script/module/command/controlButton.js',
	'Script/module/command/controlDialog.js',
	'Script/module/command/createActor.js',
	'Script/module/command/createElement.js',
	'Script/module/command/createGlobalActor.js',
	'Script/module/command/createObject.js',
	'Script/module/command/createTrigger.js',
	'Script/module/command/deleteActor.js',
	'Script/module/command/deleteElement.js',
	'Script/module/command/deleteGlobalActor.js',
	'Script/module/command/deleteObject.js',
	'Script/module/command/deleteScene.js',
	'Script/module/command/deleteTile.js',
	'Script/module/command/deleteVariable.js',
	'Script/module/command/detectTargets.js',
	'Script/module/command/discardTargets.js',
	'Script/module/command/downloadFile.js',
	'Script/module/command/fixAngle.js',
	'Script/module/command/followActor.js',
	'Script/module/command/forEach.js',
	'Script/module/command/gameData.js',
	'Script/module/command/getActor.js',
	'Script/module/command/getMultipleActors.js',
	'Script/module/command/getObjectProperty.js',
	'Script/module/command/getTarget.js',
	'Script/module/command/httpRequest.js',
	'Script/module/command/if.js',
	'Script/module/command/independent.js',
	'Script/module/command/jumpTo.js',
	'Script/module/command/label.js',
	'Script/module/command/loadImage.js',
	'Script/module/command/loadScene.js',
	'Script/module/command/loadSubscene.js',
	'Script/module/command/loop.js',
	'Script/module/command/moveActor.js',
	'Script/module/command/moveCamera.js',
	'Script/module/command/moveElement.js',
	'Script/module/command/moveLight.js',
	'Script/module/command/nestElement.js',
	'Script/module/command/pauseGame.js',
	'Script/module/command/playActorAnimation.js',
	'Script/module/command/playAnimation.js',
	'Script/module/command/playAudio.js',
	'Script/module/command/preventSceneInput.js',
	'Script/module/command/registerEvent.js',
	'Script/module/command/relaunchApp.js',
	'Script/module/command/removeAnimationComponent.js',
	'Script/module/command/removeTarget.js',
	'Script/module/command/renderOutline.js',
	'Script/module/command/requestURL.js',
	'Script/module/command/reset.js',
	'Script/module/command/resetTargets.js',
	'Script/module/command/restoreAudio.js',
	'Script/module/command/restoreSceneInput.js',
	'Script/module/command/return.js',
	'Script/module/command/saveAudio.js',
	'Script/module/command/schema.js',
	'Script/module/command/script.js',
	'Script/module/command/setActive.js',
	'Script/module/command/setAmbientLight.js',
	'Script/module/command/setAngle.js',
	'Script/module/command/setAnimation.js',
	'Script/module/command/setAnimationComponent.js',
	'Script/module/command/setBoolean.js',
	'Script/module/command/setButton.js',
	'Script/module/command/setCooldown.js',
	'Script/module/command/setCursor.js',
	'Script/module/command/setDialogBox.js',
	'Script/module/command/setElement.js',
	'Script/module/command/setEvent.js',
	'Script/module/command/setFocus.js',
	'Script/module/command/setGameSpeed.js',
	'Script/module/command/setImage.js',
	'Script/module/command/setInventory.js',
	'Script/module/command/setItem.js',
	'Script/module/command/setLanguage.js',
	'Script/module/command/setList.js',
	'Script/module/command/setLoop.js',
	'Script/module/command/setMovementSpeed.js',
	'Script/module/command/setNumber.js',
	'Script/module/command/setObject.js',
	'Script/module/command/setObjectAnimation.js',
	'Script/module/command/setPan.js',
	'Script/module/command/setPartyMember.js',
	'Script/module/command/setPlayerActor.js',
	'Script/module/command/setPointerEventRoot.js',
	'Script/module/command/setProgressBar.js',
	'Script/module/command/setResolution.js',
	'Script/module/command/setReverb.js',
	'Script/module/command/setShortcut.js',
	'Script/module/command/setSkill.js',
	'Script/module/command/setState.js',
	'Script/module/command/setString.js',
	'Script/module/command/setTarget.js',
	'Script/module/command/setTeamRelation.js',
	'Script/module/command/setTerrain.js',
	'Script/module/command/setText.js',
	'Script/module/command/setTextBox.js',
	'Script/module/command/setTile.js',
	'Script/module/command/setTriggerAngle.js',
	'Script/module/command/setTriggerDuration.js',
	'Script/module/command/setTriggerMotion.js',
	'Script/module/command/setTriggerSpeed.js',
	'Script/module/command/setVideo.js',
	'Script/module/command/setVolume.js',
	'Script/module/command/setWeight.js',
	'Script/module/command/setWindow.js',
	'Script/module/command/setZoomFactor.js',
	'Script/module/command/shakeScreen.js',
	'Script/module/command/showChoices.js',
	'Script/module/command/showText.js',
	'Script/module/command/simulateKey.js',
	'Script/module/command/stopActorAnimation.js',
	'Script/module/command/stopAudio.js',
	'Script/module/command/stopEvent.js',
	'Script/module/command/switch.js',
	'Script/module/command/switchCollisionSystem.js',
	'Script/module/command/tintImage.js',
	'Script/module/command/tintScreen.js',
	'Script/module/command/transferGlobalActor.js',
	'Script/module/command/transition.js',
	'Script/module/command/translateActor.js',
	'Script/module/command/unclampCamera.js',
	'Script/module/command/unloadSubscene.js',
	'Script/module/command/uploadFile.js',
	'Script/module/command/useItem.js',
	'Script/module/command/wait.js',
	'Script/module/command/waitForVideo.js',
	'Script/module/command/webSocketClose.js',
	'Script/module/command/webSocketConnect.js',
	'Script/module/command/webSocketSend.js',
	'Script/module/editdata.js',
	'Script/module/eslints.js',
	'Script/module/eventbus.js',
	'Script/module/global.js',
	'Script/module/net.js',
	'Script/module/resource.js',
	'Script/module/searchstring.js',
	'Script/module/settingconfig.js',
	'Script/module/webserver.js',
	'Script/palette/auto-tile.js',
	'Script/palette/palette.js',
	'Script/palette/tile-frame-generator.js',
	'Script/palette/tile-frame-index.js',
	'Script/palette/tile-node-window.js',
	'Script/particle/particle-element.js',
	'Script/particle/particle-emitter.js',
	'Script/particle/particle-layer.js',
	'Script/particle/particle-window.js',
	'Script/plugin/plugin.js',
	'Script/printer/printer.js',
	'Script/scene/coordinate-point.js',
	'Script/scene/default-object-folder.js',
	'Script/scene/light.js',
	'Script/scene/move-scene.js',
	'Script/scene/parallax.js',
	'Script/scene/scene-animate.js',
	'Script/scene/scene-camera.js',
	'Script/scene/scene-context.js',
	'Script/scene/scene-create-default-animation.js',
	'Script/scene/scene-draw.js',
	'Script/scene/scene-edit.js',
	'Script/scene/scene-events.js',
	'Script/scene/scene-list.js',
	'Script/scene/scene-map-record.js',
	'Script/scene/scene-marquee.js',
	'Script/scene/scene-selection.js',
	'Script/scene/scene-target.js',
	'Script/scene/scene-utility.js',
	'Script/scene/scene-window.js',
	'Script/scene/texture-set.js',
	'Script/scene/tilemap-shortcut-list.js',
	'Script/sprite/sprite.js',
	'Script/title/deploy-project-window.js',
	'Script/title/home-page.js',
	'Script/title/menu-bar.js',
	'Script/title/new-project-window.js',
	'Script/title/title-bar.js',
	'Script/tools/array-window.js',
	'Script/tools/color-picker-window.js',
	'Script/tools/condition-list.js',
	'Script/tools/event-list.js',
	'Script/tools/history.js',
	'Script/tools/image-crop-window.js',
	'Script/tools/localization.js',
	'Script/tools/pointer-object.js',
	'Script/tools/preset-element-window.js',
	'Script/tools/property-list.js',
	'Script/tools/rename-window.js',
	'Script/tools/scene-preset-window.js',
	'Script/tools/script-list.js',
	'Script/tools/set-key-window.js',
	'Script/tools/set-number-window.js',
	'Script/tools/shortcut-registry.js',
	'Script/tools/text-capture.js',
	'Script/tools/undo-manager.js',
	'Script/tools/window-object.js',
	'Script/tools/zoom-window.js',
	'Script/ui/animation-element.js',
	'Script/ui/button-element.js',
	'Script/ui/container-element.js',
	'Script/ui/dialog-element.js',
	'Script/ui/element-base.js',
	'Script/ui/element-instance-list.js',
	'Script/ui/image-element.js',
	'Script/ui/progress-bar-element.js',
	'Script/ui/reference-element.js',
	'Script/ui/root-element.js',
	'Script/ui/text-box-element.js',
	'Script/ui/text-element.js',
	'Script/ui/ui-window.js',
	'Script/ui/video-element.js',
	'Script/ui/window-element.js',
	'Script/update/actors.js',
	'Script/update/animations.js',
	'Script/update/backup.js',
	'Script/update/config.js',
	'Script/update/elements.js',
	'Script/update/equipments.js',
	'Script/update/events.js',
	'Script/update/incremental.js',
	'Script/update/items.js',
	'Script/update/localization.js',
	'Script/update/particles.js',
	'Script/update/project.js',
	'Script/update/scenes.js',
	'Script/update/skills.js',
	'Script/update/states.js',
	'Script/update/teams.js',
	'Script/update/tilesets.js',
	'Script/update/to-latest.js',
	'Script/update/triggers.js',
	'Script/update/updater.js',
	'Script/update/version-warning.js',
	'Script/util/color-utils.js',
	'Script/util/config.js',
	'Script/util/dom.js',
	'Script/util/event-accessors.js',
	'Script/util/safe.js',
	'Script/util/stage-color.js',
	'Script/util/timer.js',
	'Script/variable/data.js',
	'Script/variable/history.js',
	'Script/variable/id.js',
	'Script/variable/initialize.js',
	'Script/variable/keyboard-events.js',
	'Script/variable/list-events.js',
	'Script/variable/list-methods.js',
	'Script/variable/open.js',
	'Script/variable/panel.js',
	'Script/variable/variable.js',
	'Script/variable/window-events.js',
	'Script/webgl/base-texture.js',
	'Script/webgl/batch-renderer.js',
	'Script/webgl/image-texture.js',
	'Script/webgl/matrix2.js',
	'Script/webgl/texture-manager.js',
	'Script/webgl/texture.js',
	'Script/webgl/vector2.js',
	'Script/webgl/webgl-init.js',
	'Script/webgl/webgl-methods.js'
])

// Generate module-init.js
const imports = userScripts.map((p) => {
	const relative = path.relative(
		path.dirname(initOut),
		path.resolve(projectDir, p)
	)
	const normalized = relative.replace(/\\/g, '/')
	return `import '${normalized.startsWith('.') ? normalized : './' + normalized}'`
})
// monaco-editor 改由 pnpm 包载入（删 vs/ 手动源码 AMD 标签），namespace import 入口载入让包打进 bundle；
// 各调用文件顶部自行 `import * as monaco from 'monaco-editor'`（script.js/editdata.js 等），不绑 window.monaco
imports.unshift("import * as monaco from 'monaco-editor'")
fs.writeFileSync(
	initOut,
	`// Auto-generated by scripts/build-module.js\n// Imports all modules in dependency order (from head.html)\n\n${imports.join('\n')}\n`,
	'utf-8'
)
console.log(
	`[build-module] ✓ Generated module-init.js (${userScripts.length} imports)`
)

let modifiedCount = 0
let exportCount = 0
let requireFixCount = 0

for (const relPath of userScripts) {
	const fullPath = path.resolve(projectDir, relPath)
	if (!fs.existsSync(fullPath)) {
		console.warn(`[build-module] ⚠ File not found: ${fullPath}`)
		continue
	}

	if (realEsmExclude.has(relPath)) {
		console.log(`[build-module] ⊘ skipped (real ESM) → ${relPath}`)
		continue
	}

	let content = fs.readFileSync(fullPath, 'utf-8')
	const hadExports =
		/^\s*export\s+(const|var|let|function|class|default)/m.test(content)

	// --- Step 1: add exports + window bindings (if not already done) ---
	let lines = content.split('\n')
	const names = hadExports ? [] : scanTopDeclNames(lines)
	let changed = false

	if (names.length > 0) {
		for (const { lineIdx, pattern, replacement } of names) {
			lines[lineIdx] = lines[lineIdx].replace(pattern, replacement)
		}
		lines.push('')
		for (const { name } of names) {
			lines.push(`window.${name} = ${name}`)
		}
		changed = true
		exportCount += names.length
	}

	// --- Step 2: add bare require() support for modules ---
	if (
		usesBareRequire(content) &&
		!content.includes('__nodeRequire') &&
		!content.includes('const require =')
	) {
		const requireLine =
			'const require = window.__nodeRequire || window.require'
		// Insert right after 'use strict' (or at top if no strict mode)
		let insertAt = 0
		for (let i = 0; i < lines.length; i++) {
			const t = lines[i].trim()
			if (t === "'use strict'" || t === '"use strict"') {
				insertAt = i + 1
				break
			}
		}
		lines.splice(insertAt, 0, requireLine)
		changed = true
		requireFixCount++
	}

	if (changed) {
		content = lines.join('\n')
		fs.writeFileSync(fullPath, content, 'utf-8')
		modifiedCount++
		const msg = []
		if (names.length) msg.push(`${names.length} export(s)`)
		if (requireFixCount > 0 && changed && content.includes('__nodeRequire'))
			msg.push('require fix')
		console.log(`[build-module] ✓ ${msg.join(' + ')} → ${relPath}`)
	}
}

console.log(
	`[build-module] ✓ Done. Modified ${modifiedCount} files, added ${exportCount} exports, fixed ${requireFixCount} require() calls.`
)

function usesBareRequire(content) {
	return /\brequire\s*\(/.test(content)
}

function scanTopDeclNames(lines) {
	const results = []
	let braceDepth = 0

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const trimmed = line.trim()

		const depthBefore = braceDepth
		for (const ch of line) {
			if (ch === '{') braceDepth++
			else if (ch === '}') braceDepth--
		}

		if (depthBefore !== 0) continue

		if (
			trimmed.startsWith('//') ||
			trimmed.startsWith('/*') ||
			trimmed.startsWith('*') ||
			trimmed === '' ||
			trimmed.startsWith('}')
		)
			continue

		const varMatchEq = trimmed.match(/^(const|let|var)\s+([\w$]+)\s*=\s*/)
		if (
			varMatchEq &&
			!trimmed.match(/^(const|let|var)\s*\{/) &&
			varMatchEq[2] !== 'require'
		) {
			const escName = varMatchEq[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			results.push({
				lineIdx: i,
				name: varMatchEq[2],
				pattern: new RegExp(
					`^(${varMatchEq[1]})\\s+${escName}\\s*=\\s*`
				),
				replacement: `export ${varMatchEq[1]} ${varMatchEq[2]} = `
			})
			continue
		}

		const varMatchNoEq = trimmed.match(
			/^(const|let|var)\s+([\w$]+)\s*(;|\/\/.*)?$/
		)
		if (
			varMatchNoEq &&
			!trimmed.match(/^(const|let|var)\s*\{/) &&
			varMatchNoEq[2] !== 'require'
		) {
			const escName = varMatchNoEq[2].replace(
				/[.*+?^${}()|[\]\\]/g,
				'\\$&'
			)
			results.push({
				lineIdx: i,
				name: varMatchNoEq[2],
				pattern: new RegExp(
					`^(${varMatchNoEq[1]})\\s+${escName}\\s*(;|\/\/.*)?$`
				),
				replacement: `export ${varMatchNoEq[1]} ${varMatchNoEq[2]}`
			})
			continue
		}

		const funcMatch = trimmed.match(/^function\s+([\w$]+)\s*\(/)
		if (funcMatch) {
			results.push({
				lineIdx: i,
				name: funcMatch[1],
				pattern: /^function\s+/,
				replacement: 'export function '
			})
			continue
		}

		const classMatch = trimmed.match(/^class\s+([\w$]+)/)
		if (classMatch) {
			results.push({
				lineIdx: i,
				name: classMatch[1],
				pattern: /^class\s+/,
				replacement: 'export class '
			})
		}
	}

	return results
}
