import { SettingConfig } from './settingconfig.ts';
import { Browser } from '../browser/project-browser.ts';
export const BrowserSearchHistory: any = {
	histories: [],
	input: null,
	dropdown: null,
	outsideHandler: null,
	themeObserver: null
};

BrowserSearchHistory.initialize = function () {
	if (typeof Browser === 'undefined') return;
	const initialize = Browser.initialize;
	Browser.initialize = function () {
		initialize.call(this);
		BrowserSearchHistory.bind(this.searcher);
	};
};

BrowserSearchHistory.bind = function (searcher) {
	const input = this.getInput(searcher);
	if (!input || input === this.input) return;
	this.input = input;
	input.addEventListener('focus', this.focus);
	input.addEventListener('blur', this.blur);
	this.initThemeObserver();
};

BrowserSearchHistory.getInput = function (searcher) {
	if (!searcher) return null;
	return (
		searcher.querySelector?.('.text-box-input') ?? searcher.querySelector?.('input') ?? searcher
	);
};

BrowserSearchHistory.getLimit = function () {
	const config =
		typeof SettingConfig !== 'undefined'
			? SettingConfig.config?.other?.browserSearchHistoryLimit
			: 9;
	const limit = Math.floor(Number(config));
	return Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 9) : 9;
};

BrowserSearchHistory.add = function (keyword) {
	if (!keyword) return;
	const k = keyword.trim();
	if (!k) return;
	const idx = this.histories.indexOf(k);
	if (idx !== -1) this.histories.splice(idx, 1);
	this.histories.unshift(k);
	if (this.histories.length > 9) this.histories.length = 9;
};

BrowserSearchHistory.remove = function (keyword) {
	const idx = this.histories.indexOf(keyword);
	if (idx !== -1) this.histories.splice(idx, 1);
};

BrowserSearchHistory.focus = function () {
	BrowserSearchHistory.show(this);
};

BrowserSearchHistory.blur = function () {
	BrowserSearchHistory.add(this.value);
	setTimeout(() => {
		BrowserSearchHistory.hide();
	}, 150);
};

BrowserSearchHistory.getThemeStyles = function () {
	const isDarkTheme = document.documentElement.classList.contains('dark');
	return {
		dropdown: {
			background: isDarkTheme ? '#383838' : '#f0f0f0',
			border: isDarkTheme ? '1px solid #181818' : '1px solid #c0c0c0',
			boxShadow: isDarkTheme
				? '0 6px 18px rgba(0, 0, 0, 0.5)'
				: '0 6px 18px rgba(0, 0, 0, 0.15)',
			color: isDarkTheme ? '#d8d8d8' : '#000000'
		},
		item: {
			color: isDarkTheme ? '#d8d8d8' : '#000000',
			hoverBg: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
		}
	};
};

BrowserSearchHistory.initThemeObserver = function () {
	if (this.themeObserver) return;
	this.themeObserver = new MutationObserver(() => {
		if (!this.dropdown) return;
		const styles = this.getThemeStyles();
		Object.assign(this.dropdown.style, styles.dropdown);
		for (const item of this.dropdown.querySelectorAll('.browser-search-item')) {
			item.style.color = styles.item.color;
			item.style.background = '';
		}
	});
	this.themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class']
	});
};

BrowserSearchHistory.createDropdown = function () {
	if (this.dropdown) return;
	const el = document.createElement('div');
	el.className = 'browser-search-history-dropdown';
	Object.assign(el.style, {
		position: 'absolute',
		zIndex: 9999,
		padding: '2px 0',
		maxHeight: '300px',
		overflow: 'auto',
		overflowX: 'hidden',
		display: 'none',
		fontSize: '12px',
		scrollbarWidth: 'none',
		msOverflowStyle: 'none'
	});
	Object.assign(el.style, this.getThemeStyles().dropdown);
	el.addEventListener('mousedown', (event) => {
		event.preventDefault();
	});
	document.body.appendChild(el);
	this.dropdown = el;
};

BrowserSearchHistory.show = function (input) {
	this.createDropdown();
	const el = this.dropdown;
	if (this.histories.length === 0) {
		el.style.display = 'none';
		return;
	}
	el.innerHTML = '';
	const styles = this.getThemeStyles();
	for (const keyword of this.histories.slice(0, this.getLimit())) {
		el.appendChild(this.createItem(input, keyword, styles));
	}
	const anchor = input.closest?.('text-box') ?? input;
	const rect = anchor.getBoundingClientRect();
	el.style.width = `${rect.width}px`;
	el.style.boxSizing = 'border-box';
	el.style.left = `${rect.left + window.scrollX}px`;
	el.style.top = `${rect.bottom + window.scrollY}px`;
	el.style.display = 'block';
	if (this.outsideHandler) {
		document.removeEventListener('mousedown', this.outsideHandler);
		this.outsideHandler = null;
	}
	setTimeout(() => {
		this.outsideHandler = (event) => {
			if (!el.contains(event.target) && event.target !== input) {
				this.hide();
			}
		};
		document.addEventListener('mousedown', this.outsideHandler);
	}, 0);
};

BrowserSearchHistory.createItem = function (input, keyword, styles) {
	const item = document.createElement('div');
	item.className = 'browser-search-item';
	Object.assign(item.style, {
		position: 'relative',
		padding: '2px 26px 2px 8px',
		lineHeight: '18px',
		minHeight: '18px',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		color: styles.item.color,
		transition: 'background 0.2s ease'
	});
	const text = document.createElement('span');
	text.textContent = keyword;
	const deleteButton = document.createElement('box');
	deleteButton.className = 'close-button browser-search-delete-button';
	deleteButton.textContent = '\u2716';
	Object.assign(deleteButton.style, {
		top: '50%',
		transform: 'translateY(-50%)'
	});
	deleteButton.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		this.remove(keyword);
		item.remove();
		if (this.histories.length === 0) {
			this.hide();
		} else {
			this.show(input);
		}
	});
	item.addEventListener('click', () => {
		input.value = keyword;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.focus();
		this.hide();
	});
	item.addEventListener('mouseover', () => {
		item.style.background = this.getThemeStyles().item.hoverBg;
	});
	item.addEventListener('mouseout', () => {
		item.style.background = '';
	});
	item.appendChild(text);
	item.appendChild(deleteButton);
	return item;
};

BrowserSearchHistory.hide = function () {
	if (!this.dropdown) return;
	this.dropdown.style.display = 'none';
	if (this.outsideHandler) {
		document.removeEventListener('mousedown', this.outsideHandler);
		this.outsideHandler = null;
	}
};

BrowserSearchHistory.initialize();
