import { Data } from '../data/data-object.js'
import { EventEditor } from '../command/event-editor.js'
import { File } from '../file/file-system-core.js'
import { Inspector } from '../inspector/inspector.js'
import { Updater } from './updater.js'

// 更新本地事件数据
Updater.updateLocalEvents = function (verNum) {
	// 更新到1.0.122版本：添加enabled属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const listMap = EventEditor.getAllLocalEvents()
		for (const [guid, events] of Object.entries(listMap)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			for (const event of events) {
				const { commands } = event
				delete event.commands
				event.enabled = true
				event.commands = commands
			}
			File.planToSave(meta, guid)
		}
	}
}

// 更新全局事件数据
Updater.updateGlobalEvents = function (verNum) {
	// 更新到1.0.105版本：添加priority属性
	// 更新到1.0.122版本：添加namespace|returnType|description|parameters属性
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const events = Data.events
		const keys = Object.keys(Inspector.fileEvent.create('global'))
		for (const [guid, sEvent] of Object.entries(events)) {
			const meta = Data.manifest.guidMap[guid]
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`)
			}
			const dEvent = Inspector.fileEvent.create('global')
			for (const key of keys) {
				if (key in sEvent) {
					dEvent[key] = sEvent[key]
					continue
				}
				switch (key) {
					case 'namespace':
						dEvent[key] = false
						continue
				}
			}
			events[guid] = dEvent
			File.planToSave(meta)
		}
	}
}

// 更新单个全局事件数据
Updater.updateGlobalEvent = function (meta) {
	// 更新到1.0.105版本：添加priority属性
	// 更新到1.0.122版本：添加namespace|returnType|description|parameters属性
	const guid = meta.guid
	const sEvent = Data.events[guid]
	if ('namespace' in sEvent || 'priority' in sEvent) return
	const dEvent = Inspector.fileEvent.create('global')
	for (const key of Object.keys(dEvent)) {
		if (key in sEvent) {
			dEvent[key] = sEvent[key]
			continue
		}
		switch (key) {
			case 'namespace':
				dEvent[key] = false
				continue
		}
	}
	Data.events[guid] = dEvent
	File.planToSave(meta)
}
