import { $ } from '../util/dom.ts';
import { Window } from '../tools/window-object.ts';
import { Updater } from '../update/updater.ts';

export const UpdateLog = {
	content: $('#update-log-content'),
	currentMode: null,
	internalItems: null,
	communityItems: null,
	open: null,
	update: null,
	initialize: null,
	switchMode: null,
	loadCommunityReleases: null,
	displayDonationList: null,
	parseCommunityReleases: null,
	windowClosed: null
};

UpdateLog.initialize = function () {
	$('#update-log').on('closed', this.windowClosed);
};

UpdateLog.open = function (items = null) {
	if (items instanceof Array) {
		Window.open('update-log');
		this.update(items);
	} else {
		Updater.updateIncrementalChanges(Updater.latestProjectVersion);
	}
};

UpdateLog.update = function (items) {
	this.content.clear();
	for (const item of items) {
		if (item.title) {
			const title = document.createElement('text');
			title.textContent = item.title;
			title.addClass('update-log-title');
			this.content.appendChild(title);
		}
		if (item.major) {
			const major = document.createElement('text');
			major.textContent = item.major;
			major.addClass('update-log-major');
			this.content.appendChild(major);
		}
		if (item.minor) {
			const minor = document.createElement('text');
			minor.textContent = item.minor;
			minor.addClass('update-log-minor');
			this.content.appendChild(minor);
		}
	}
};

UpdateLog.windowClosed = function () {
	UpdateLog.content.clear();
};
