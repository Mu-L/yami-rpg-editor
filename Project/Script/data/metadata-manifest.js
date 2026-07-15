'use strict'

// ******************************** 元数据清单类 ********************************

export class Manifest {
	actors = []
	skills = []
	triggers = []
	items = []
	equipments = []
	states = []
	events = []
	scenes = []
	tilesets = []
	ui = []
	animations = []
	particles = []
	images = []
	audio = []
	videos = []
	fonts = []
	script = []
	others = []

	constructor() {
		Object.defineProperties(this, {
			metaList: { value: [] },
			guidMap: { value: {} },
			pathMap: { value: {} },
			project: { value: {} },
			changes: { value: [] },
			changed: { writable: true, value: false },
			code: { writable: true, value: '' }
		})
	}

	// 更新
	update() {
		const { metaList } = this
		const { versionId } = Meta
		let i = metaList.length
		while (--i >= 0) {
			const meta = metaList[i]
			// 如果版本ID不一致，表示文件已被删除
			if (meta.versionId !== versionId) {
				this.deleteMeta(meta)
			}
		}
	}

	// 删除元数据
	deleteMeta(meta) {
		const { guidMap } = this
		const { pathMap } = this
		const { guid, path } = meta
		this.metaList.remove(meta)
		meta.group.remove(meta)
		if (guidMap[guid] === meta) {
			delete guidMap[guid]
		}
		if (pathMap[path] === meta) {
			delete pathMap[path]
		}
		const { dataMap } = meta
		if (dataMap) {
			// 从待保存列表中移除
			File.cancelSave(meta)
			// 关闭已打开的标签
			switch (dataMap) {
				case Data.scenes:
				case Data.ui:
				case Data.animations:
				case Data.particles:
					Title.tabBar.closeByProperty('meta', meta)
					break
			}
			// 移除UI预设元素的链接
			switch (dataMap) {
				case Data.scenes:
					Data.unregisterScenePresets(guid)
					break
				case Data.ui:
					Data.unregisterUiPresets(guid)
					break
			}
			delete dataMap[guid]
		}
		this.changed = true
		console.log(`delete meta: ${meta.path}`)
	}
}

window.Manifest = Manifest
